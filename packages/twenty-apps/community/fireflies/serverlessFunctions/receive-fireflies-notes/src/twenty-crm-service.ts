import { createLogger } from './logger';
import type {
  Contact,
  CreateMeetingResponse,
  CreateNoteResponse,
  CreatePersonResponse,
  FindMeetingResponse,
  FindPeopleResponse,
  FirefliesParticipant,
  GraphQLResponse,
  IdNode,
  MeetingCreateInput,
} from './types';

const logger = createLogger('20 CRM Service');

export class TwentyCrmService {
  private apiKey: string;
  private apiUrl: string;
  private isTestEnvironment: boolean;

  constructor(apiKey: string, apiUrl: string) {
    if (!apiKey) {
      logger.critical('TWENTY_API_KEY is required but not provided - this is a critical configuration error');
      throw new Error('TWENTY_API_KEY is required');
    }
    this.apiKey = apiKey;
    this.apiUrl = apiUrl;
    this.isTestEnvironment = process.env.NODE_ENV === 'test' || process.env.JEST_WORKER_ID !== undefined;
  }

  async findExistingMeeting(title: string): Promise<IdNode | undefined> {
    const query = `
      query FindMeeting($title: String!) {
        meetings(filter: { name: { eq: $title } }) {
          edges { node { id } }
        }
      }
    `;

    const variables = { title };
    const response = await this.gqlRequest<FindMeetingResponse>(query, variables);
    return response.data?.meetings?.edges?.[0]?.node;
  }

  async matchParticipantsToContacts(
    participants: FirefliesParticipant[],
  ): Promise<{
    matchedContacts: Contact[];
    unmatchedParticipants: FirefliesParticipant[];
  }> {
    if (participants.length === 0) {
      return { matchedContacts: [], unmatchedParticipants: [] };
    }

    // Split participants into those with emails and those with names only
    const participantsWithEmails = participants.filter(p => p.email && p.email.trim());
    const participantsNameOnly = participants.filter(p => !p.email || !p.email.trim());

    let matchedContacts: Contact[] = [];
    let unmatchedParticipants: FirefliesParticipant[] = [];

    // 1. Match by email first
    if (participantsWithEmails.length > 0) {
      const emailMatches = await this.matchByEmail(participantsWithEmails);
      matchedContacts.push(...emailMatches.matchedContacts);
      unmatchedParticipants.push(...emailMatches.unmatchedParticipants);
    }

    // 2. For participants without emails, try name-based matching
    if (participantsNameOnly.length > 0) {
      const nameMatches = await this.matchByName(participantsNameOnly, matchedContacts);
      matchedContacts.push(...nameMatches.matchedContacts);
      unmatchedParticipants.push(...nameMatches.unmatchedParticipants);
    }

    return { matchedContacts, unmatchedParticipants };
  }

  private async matchByEmail(participants: FirefliesParticipant[]): Promise<{
    matchedContacts: Contact[];
    unmatchedParticipants: FirefliesParticipant[];
  }> {
    const emails = participants.map(({ email }) => email).filter(Boolean);
    const query = `
      query FindPeople($emails: [String!]!) {
        people(filter: { emails: { primaryEmail: { in: $emails } } }) {
          edges { node { id emails { primaryEmail } } }
        }
      }
    `;

    const variables = { emails };
    const response = await this.gqlRequest<FindPeopleResponse>(query, variables);
    const people = response.data?.people;

    if (!people?.edges) {
      return { matchedContacts: [], unmatchedParticipants: participants };
    }

    const matchedContacts = people.edges.map(({ node }) => ({
      id: node.id,
      email: node.emails?.primaryEmail || ''
    }));

    const matchedEmails = new Set(
      matchedContacts
        .map(({ email }) => email)
        .filter((email) => Boolean(email)),
    );

    const unmatchedParticipants = participants.filter(
      ({ email }) => !matchedEmails.has(email)
    );

    return { matchedContacts, unmatchedParticipants };
  }

  private async matchByName(
    participants: FirefliesParticipant[],
    alreadyMatchedContacts: Contact[]
  ): Promise<{
    matchedContacts: Contact[];
    unmatchedParticipants: FirefliesParticipant[];
  }> {
    const matchedContacts: Contact[] = [];
    const unmatchedParticipants: FirefliesParticipant[] = [];

    // Get set of already matched contact IDs to avoid duplicates
    const alreadyMatchedIds = new Set(alreadyMatchedContacts.map(c => c.id));

    for (const participant of participants) {
      const nameMatch = await this.findContactByName(participant.name);

      if (nameMatch && !alreadyMatchedIds.has(nameMatch.id)) {
        matchedContacts.push(nameMatch);
        alreadyMatchedIds.add(nameMatch.id);
      } else {
        unmatchedParticipants.push(participant);
      }
    }

    return { matchedContacts, unmatchedParticipants };
  }

  private async findContactByName(name: string): Promise<Contact | null> {
    if (!name || !name.trim()) {
      return null;
    }

    const nameParts = name.trim().split(/\s+/);
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ');

    // Try exact name match first
    let query = `
      query FindPeopleByName($firstName: String!, $lastName: String) {
        people(filter: {
          and: [
            { name: { firstName: { eq: $firstName } } }
            ${lastName ? '{ name: { lastName: { eq: $lastName } } }' : ''}
          ]
        }) {
          edges { node { id emails { primaryEmail } name { firstName lastName } } }
        }
      }
    `;

    let variables: any = { firstName };
    if (lastName) {
      variables.lastName = lastName;
    }

    try {
      const response = await this.gqlRequest<any>(query, variables);
      const people = response.data?.people?.edges;

      if (people && people.length > 0) {
        const person = people[0].node;
        return {
          id: person.id,
          email: person.emails?.primaryEmail || ''
        };
      }

      // If no exact match and we have a last name, try fuzzy matching
      if (lastName) {
        query = `
          query FindPeopleByNameFuzzy($firstName: String!) {
            people(filter: { name: { firstName: { ilike: $firstName } } }) {
              edges { node { id emails { primaryEmail } name { firstName lastName } } }
            }
          }
        `;

        const fuzzyResponse = await this.gqlRequest<any>(query, { firstName: `%${firstName}%` });
        const fuzzyPeople = fuzzyResponse.data?.people?.edges;

        if (fuzzyPeople && fuzzyPeople.length > 0) {
          // Find best match by checking if last name contains our target
          const bestMatch = fuzzyPeople.find((edge: any) => {
            const personLastName = edge.node.name?.lastName || '';
            return personLastName.toLowerCase().includes(lastName.toLowerCase());
          });

          if (bestMatch) {
            const person = bestMatch.node;
            return {
              id: person.id,
              email: person.emails?.primaryEmail || ''
            };
          }
        }
      }

      return null;
    } catch {
      // Silently fail - don't break the entire process for a single contact lookup
      return null;
    }
  }

  async createContactsForUnmatched(
    participants: FirefliesParticipant[],
  ): Promise<string[]> {
    const newContactIds: string[] = [];

    // Split participants into those with emails and those with names only
    const participantsWithEmails = participants.filter(p => p.email && p.email.trim());
    const participantsNameOnly = participants.filter(p => !p.email || !p.email.trim());

    // Process participants with emails
    if (participantsWithEmails.length > 0) {
      const emailContactIds = await this.createContactsWithEmails(participantsWithEmails);
      newContactIds.push(...emailContactIds);
    }

    // Process participants with names only
    if (participantsNameOnly.length > 0) {
      const nameContactIds = await this.createContactsNameOnly(participantsNameOnly);
      newContactIds.push(...nameContactIds);
    }

    return newContactIds;
  }

  private async createContactsWithEmails(participants: FirefliesParticipant[]): Promise<string[]> {
    const newContactIds: string[] = [];

    // Deduplicate participants by email to prevent duplicate contact creation
    const uniqueParticipants = participants.reduce<FirefliesParticipant[]>((unique, participant) => {
      const existing = unique.find(p => p.email === participant.email);
      if (!existing) {
        unique.push(participant);
      } else {
        logger.warn(`Duplicate participant email detected: ${participant.email}. Using first occurrence.`);
      }
      return unique;
    }, []);

    for (const participant of uniqueParticipants) {
      const [firstName, ...lastNameParts] = participant.name.trim().split(/\s+/);
      const lastName = lastNameParts.join(' ');

      const mutation = `
        mutation CreatePerson($data: PersonCreateInput!) {
          createPerson(data: $data) { id }
        }
      `;

      const variables = {
        data: {
          name: { firstName, lastName },
          emails: { primaryEmail: participant.email },
        },
      };

      try {
        const response = await this.gqlRequest<CreatePersonResponse>(mutation, variables);
        if (!response.data?.createPerson?.id) {
          throw new Error(`Failed to create contact for ${participant.email}`);
        }
        newContactIds.push(response.data.createPerson.id);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        if (errorMessage.includes('Duplicate Emails') || errorMessage.includes('BAD_USER_INPUT')) {
            logger.warn(`Skipping contact creation for ${participant.email} due to duplicate email constraint: ${errorMessage}`);
          continue;
        }
        throw error;
      }
    }

    return newContactIds;
  }

  private async createContactsNameOnly(participants: FirefliesParticipant[]): Promise<string[]> {
    const newContactIds: string[] = [];

    // Deduplicate participants by name to prevent duplicate contact creation
    const uniqueParticipants = participants.reduce<FirefliesParticipant[]>((unique, participant) => {
      const existing = unique.find(p =>
        p.name.toLowerCase().trim() === participant.name.toLowerCase().trim()
      );
      if (!existing) {
        unique.push(participant);
      } else {
        logger.warn(`Duplicate participant name detected: ${participant.name}. Using first occurrence.`);
      }
      return unique;
    }, []);

    for (const participant of uniqueParticipants) {
      // Check if we already have a contact with this exact name to avoid duplicates
      const existingContact = await this.findContactByName(participant.name);
      if (existingContact) {
        logger.warn(`Contact with name "${participant.name}" already exists. Skipping creation.`);
        continue;
      }

      const [firstName, ...lastNameParts] = participant.name.trim().split(/\s+/);
      const lastName = lastNameParts.join(' ');

      const mutation = `
        mutation CreatePerson($data: PersonCreateInput!) {
          createPerson(data: $data) { id }
        }
      `;

      const variables = {
        data: {
          name: { firstName, lastName },
          // Note: We don't set emails for name-only participants
          // This will create a contact without an email address
        },
      };

      try {
        const response = await this.gqlRequest<CreatePersonResponse>(mutation, variables);
        if (!response.data?.createPerson?.id) {
          throw new Error(`Failed to create contact for ${participant.name}`);
        }
        newContactIds.push(response.data.createPerson.id);

        logger.debug(`Created contact for name-only participant: ${participant.name}`);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logger.warn(`Failed to create contact for ${participant.name}: ${errorMessage}`);
        // Continue processing other participants instead of failing completely
        continue;
      }
    }

    return newContactIds;
  }

  async createNote(
    contactId: string,
    title: string,
    body: string
  ): Promise<string> {
    const noteId = await this.createNoteOnly(title, body);
    await this.createNoteTarget(noteId, contactId);
    return noteId;
  }

  async createNoteOnly(
    title: string,
    body: string
  ): Promise<string> {
    const mutation = `
      mutation CreateNote($data: NoteCreateInput!) {
        createNote(data: $data) { id }
      }
    `;

    const variables = {
      data: {
        title,
        bodyV2: {
          markdown: body.trim()
        },
      },
    };

    const response = await this.gqlRequest<CreateNoteResponse>(mutation, variables);
    if (!response.data?.createNote?.id) {
      throw new Error(`Failed to create note`);
    }

    return response.data.createNote.id;
  }

  async createNoteTarget(noteId: string, contactId: string): Promise<void> {
    const mutation = `
      mutation CreateNoteTarget($data: NoteTargetCreateInput!) {
        createNoteTarget(data: $data) {
          id
          noteId
          personId
        }
      }
    `;

    const variables = {
      data: {
        noteId,
        personId: contactId,
      },
    };

    await this.gqlRequest<any>(mutation, variables);
  }

  async createMeetingTarget(meetingId: string, contactId: string): Promise<void> {
    const mutation = `
      mutation CreateMeetingTarget($data: NoteTargetCreateInput!) {
        createNoteTarget(data: $data) {
          id
          meetingId
          personId
        }
      }
    `;

    const variables = {
      data: {
        meetingId,
        personId: contactId,
      },
    };

    await this.gqlRequest<any>(mutation, variables);
  }

  async createMeeting(meetingData: MeetingCreateInput): Promise<string> {
    const mutation = `
      mutation CreateMeeting($data: MeetingCreateInput!) {
        createMeeting(data: $data) { id }
      }
    `;

    const variables = { data: meetingData };

    // Debug: log the variables being sent
    if (!this.isTestEnvironment) {
      logger.debug('createMeeting variables:', JSON.stringify(variables, null, 2));
    }

    const response = await this.gqlRequest<CreateMeetingResponse>(mutation, variables);
    if (!response.data?.createMeeting?.id) {
      throw new Error('Failed to create meeting: Invalid response from server');
    }
    return response.data.createMeeting.id;
  }

  private async gqlRequest<T>(
    query: string,
    variables?: Record<string, unknown>
  ): Promise<GraphQLResponse<T>> {
    const url = `${this.apiUrl}/graphql`;

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({ query, variables }),
      });

      if (!res.ok) {
        let errorMessage = `GraphQL request failed with status ${res.status}`;
        try {
          const errorText = await res.text();
          if (errorText) {
            errorMessage += `: ${errorText}`;
          }
        } catch {
          // Ignore error when reading response body
        }
        throw new Error(errorMessage);
      }

      const json = await res.json() as GraphQLResponse<T> & {
        errors?: Array<{ message?: string; extensions?: Record<string, unknown> }>
      };

      if (json?.errors && Array.isArray(json.errors) && json.errors.length > 0) {
        const firstError = json.errors[0];
        const errorMessage = firstError?.message || 'GraphQL error';
        const errorCode = firstError?.extensions?.code as string | undefined;

        if (errorCode) {
          throw new Error(`${errorMessage} (Code: ${errorCode})`);
        }
        throw new Error(errorMessage);
      }

      return json;
    } catch (error) {
      logger.error('GraphQL request error:', error);
      throw error;
    }
  }

  async createFailedMeeting(meetingData: MeetingCreateInput): Promise<string> {
    const mutation = `
      mutation CreateMeeting($data: MeetingCreateInput!) {
        createMeeting(data: $data) { id }
      }
    `;

    const variables = { data: meetingData };

    if (!this.isTestEnvironment) {
      logger.debug('createFailedMeeting variables:', JSON.stringify(variables, null, 2));
    }

    const response = await this.gqlRequest<CreateMeetingResponse>(mutation, variables);
    if (!response.data?.createMeeting?.id) {
      throw new Error('Failed to create failed meeting record: Invalid response from server');
    }
    return response.data.createMeeting.id;
  }

  async findFailedMeetings(): Promise<any[]> {
    const query = `
      query FindFailedMeetings {
        meetings(filter: { importStatus: { eq: "FAILED" } }) {
          edges {
            node {
              id
              name
              firefliesMeetingId
              importError
              lastImportAttempt
              importAttempts
              createdAt
            }
          }
        }
      }
    `;

    const response = await this.gqlRequest<any>(query);
    return response.data?.meetings?.edges?.map((edge: any) => edge.node) || [];
  }

  async retryFailedMeeting(meetingId: string, updatedData: Partial<MeetingCreateInput>): Promise<void> {
    const mutation = `
      mutation UpdateMeeting($where: MeetingWhereUniqueInput!, $data: MeetingUpdateInput!) {
        updateMeeting(where: $where, data: $data) { id }
      }
    `;

    const variables = {
      where: { id: meetingId },
      data: {
        ...updatedData,
        lastImportAttempt: new Date().toISOString(),
        importAttempts: { increment: 1 }
      }
    };

    await this.gqlRequest<any>(mutation, variables);
  }
}

