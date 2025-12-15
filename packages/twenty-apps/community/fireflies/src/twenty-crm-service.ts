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

  async findMeetingByFirefliesId(meetingId: string): Promise<IdNode | undefined> {
    const query = `
      query FindMeetingByFirefliesId($meetingId: String!) {
        meetings(filter: { firefliesMeetingId: { eq: $meetingId } }) {
          edges { node { id } }
        }
      }
    `;

    const variables = { meetingId };
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

    const participantsWithEmails = participants.filter(p => p.email && p.email.trim());
    const participantsNameOnly = participants.filter(p => !p.email || !p.email.trim());

    let matchedContacts: Contact[] = [];
    let unmatchedParticipants: FirefliesParticipant[] = [];

    if (participantsWithEmails.length > 0) {
      const emailMatches = await this.matchByEmail(participantsWithEmails);
      matchedContacts.push(...emailMatches.matchedContacts);
      unmatchedParticipants.push(...emailMatches.unmatchedParticipants);
    }

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

    const hasLastName = Boolean(lastName);

    const query = hasLastName
      ? `
        query FindPeopleByName($firstName: String!, $lastName: String!) {
          people(filter: {
            and: [
              { name: { firstName: { eq: $firstName } } }
              { name: { lastName: { eq: $lastName } } }
            ]
          }) {
            edges { node { id emails { primaryEmail } name { firstName lastName } } }
          }
        }
      `
      : `
        query FindPeopleByName($firstName: String!) {
          people(filter: {
            name: { firstName: { eq: $firstName } }
          }) {
            edges { node { id emails { primaryEmail } name { firstName lastName } } }
          }
        }
      `;

    const variables: Record<string, unknown> = hasLastName
      ? { firstName, lastName }
      : { firstName };

    try {
      const response = await this.gqlRequest<{ people: { edges: Array<{ node: { id: string; emails?: { primaryEmail?: string }; name?: { firstName?: string; lastName?: string } } }> } }>(query, variables);
      const people = response.data?.people?.edges;

      if (people && people.length > 0) {
        const person = people[0].node;
        return {
          id: person.id,
          email: person.emails?.primaryEmail || ''
        };
      }

      if (hasLastName) {
        const fuzzyQuery = `
          query FindPeopleByNameFuzzy($firstName: String!) {
            people(filter: { name: { firstName: { ilike: $firstName } } }) {
              edges { node { id emails { primaryEmail } name { firstName lastName } } }
            }
          }
        `;

        const fuzzyResponse = await this.gqlRequest<{ people: { edges: Array<{ node: { id: string; emails?: { primaryEmail?: string }; name?: { firstName?: string; lastName?: string } } }> } }>(fuzzyQuery, { firstName: `%${firstName}%` });
        const fuzzyPeople = fuzzyResponse.data?.people?.edges;

        if (fuzzyPeople && fuzzyPeople.length > 0) {
          const bestMatch = fuzzyPeople.find((edge) => {
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
      return null;
    }
  }

  async createContactsForUnmatched(
    participants: FirefliesParticipant[],
  ): Promise<string[]> {
    const newContactIds: string[] = [];

    const participantsWithEmails = participants.filter(p => p.email && p.email.trim());
    const participantsNameOnly = participants.filter(p => !p.email || !p.email.trim());

    if (participantsWithEmails.length > 0) {
      const emailContactIds = await this.createContactsWithEmails(participantsWithEmails);
      newContactIds.push(...emailContactIds);
    }

    if (participantsNameOnly.length > 0) {
      const nameContactIds = await this.createContactsNameOnly(participantsNameOnly);
      newContactIds.push(...nameContactIds);
    }

    return newContactIds;
  }

  private async createContactsWithEmails(participants: FirefliesParticipant[]): Promise<string[]> {
    const newContactIds: string[] = [];

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
        const response = await this.gqlRequest<CreatePersonResponse>(mutation, variables, {
          suppressErrorCodes: ['BAD_USER_INPUT'],
          suppressErrorMessageIncludes: ['Duplicate Emails', 'duplicate entry'],
        });
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

    await this.gqlRequest<{ createNoteTarget: { id: string; noteId: string; personId: string } }>(mutation, variables);
  }

  async createMeeting(meetingData: MeetingCreateInput): Promise<string> {
    const mutation = `
      mutation CreateMeeting($data: MeetingCreateInput!) {
        createMeeting(data: $data) { id }
      }
    `;

    const variables = { data: meetingData };

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
    variables?: Record<string, unknown>,
    options?: { suppressErrorCodes?: string[]; suppressErrorMessageIncludes?: string[] }
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
      const message = error instanceof Error ? error.message : String(error);
      const suppressByCode = options?.suppressErrorCodes?.some((code) =>
        message.includes(code),
      );
      const suppressByMessage = options?.suppressErrorMessageIncludes?.some((substring) =>
        message.includes(substring),
      );
      if (!suppressByCode && !suppressByMessage) {
        logger.error('GraphQL request error:', error);
      }
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

  async findFailedMeetings(): Promise<Array<{
    id: string;
    name: string;
    firefliesMeetingId: string;
    importError: string;
    lastImportAttempt: string;
    importAttempts: number;
    createdAt: string;
  }>> {
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

    const response = await this.gqlRequest<{ meetings: { edges: Array<{ node: { id: string; name: string; firefliesMeetingId: string; importError: string; lastImportAttempt: string; importAttempts: number; createdAt: string } }> } }>(query);
    return response.data?.meetings?.edges?.map((edge) => edge.node) || [];
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

    await this.gqlRequest<{ updateMeeting: { id: string } }>(mutation, variables);
  }
}

