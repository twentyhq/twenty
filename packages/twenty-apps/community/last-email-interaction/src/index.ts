import axios from 'axios';
import { type FunctionConfig } from 'twenty-sdk';

const TWENTY_API_KEY = process.env.TWENTY_API_KEY ?? '';
const TWENTY_URL =
  process.env.TWENTY_API_URL !== '' && process.env.TWENTY_API_URL !== undefined
    ? `${process.env.TWENTY_API_URL}/rest`
    : 'https://api.twenty.com/rest';

const create_last_interaction = (id: string) => {
  return {
    method: 'POST',
    url: `${TWENTY_URL}/metadata/fields`,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TWENTY_API_KEY}`,
    },
    data: {
      type: 'DATE_TIME',
      objectMetadataId: `${id}`,
      name: 'lastInteraction',
      label: 'Last interaction',
      description: 'Date when the last interaction happened',
      icon: 'IconCalendarClock',
      defaultValue: null,
      isNullable: true,
      settings: {},
    },
  };
};

const create_interaction_status = (id: string) => {
  return {
    method: 'POST',
    url: `${TWENTY_URL}/metadata/fields`,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TWENTY_API_KEY}`,
    },
    data: {
      type: 'SELECT',
      objectMetadataId: `${id}`,
      name: 'interactionStatus',
      label: 'Interaction status',
      description: 'Indicates the health of relation',
      icon: 'IconProgress',
      defaultValue: null,
      isNullable: true,
      settings: {},
      options: [
        {
          color: 'green',
          label: 'Recent',
          value: 'RECENT',
          position: 1,
        },
        {
          color: 'yellow',
          label: 'Active',
          value: 'ACTIVE',
          position: 2,
        },
        {
          color: 'sky',
          label: 'Cooling',
          value: 'COOLING',
          position: 3,
        },
        {
          color: 'gray',
          label: 'Dormant',
          value: 'DORMANT',
          position: 4,
        },
      ],
    },
  };
};

const calculateStatus = (date: string) => {
  const day = 1000 * 60 * 60 * 24;
  const now = Date.now();
  const messageDate = Date.parse(date);
  const deltaTime = now - messageDate;
  return deltaTime < 7 * day
    ? 'RECENT'
    : deltaTime < 30 * day
      ? 'ACTIVE'
      : deltaTime < 90 * day
        ? 'COOLING'
        : 'DORMANT';
};

const updateInteractionStatus = async (objectName: string, id: string, messageDate: string, status: string) => {
  const options = {
    method: 'PATCH',
    url: `${TWENTY_URL}/${objectName}/${id}`,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TWENTY_API_KEY}`,
    },
    data: {
      lastInteraction: messageDate,
      interactionStatus: status
    }
  };
  try {
    const response = await axios.request(options);
    if (response.status === 200) {
      console.log('Successfully updated company last interaction field');
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error;
    }
    throw error;
  }
}

const fetchRelatedCompanyId = async (id: string) => {
  const options = {
    method: 'GET',
    url: `${TWENTY_URL}/people/${id}`,
    headers: {
      Authorization: `Bearer ${TWENTY_API_KEY}`,
    },
  };
  try {
    const req = await axios.request(options);
    if (req.status === 200 && req.data.person.companyId !== null && req.data.person.companyId !== undefined) {
      return req.data.person.companyId;
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error;
    }
    throw error;
  }
}

export const main = async (params: {
  properties: Record<string, any>;
  recordId: string;
  userId: string;
}): Promise<object | undefined> => {
  if (TWENTY_API_KEY === '') {
    console.log("Function exited as API key or URL hasn't been set properly");
    return {};
  }
  const { properties, recordId } = params;
  // Check if fields are created
  const options = {
    method: 'GET',
    url: `${TWENTY_URL}/metadata/objects`,
    headers: {
      Authorization: `Bearer ${TWENTY_API_KEY}`,
    },
  };
  try {
    const response = await axios.request(options);
    const objects = response.data.data.objects;
    const company_object = objects.find(
      (object: any) => object.nameSingular === 'company',
    );
    const company_last_interaction = company_object.fields.find(
      (field: any) => field.name === 'lastInteraction',
    );
    const company_interaction_status = company_object.fields.find(
      (field: any) => field.name === 'interactionStatus',
    );
    const person_object = objects.find(
      (object: any) => object.nameSingular === 'person',
    );
    const person_last_interaction = person_object.fields.find(
      (field: any) => field.name === 'lastInteraction',
    );
    const person_interaction_status = person_object.fields.find(
      (field: any) => field.name === 'interactionStatus',
    );
    // If not, create them
    if (company_last_interaction === undefined) {
      const response2 = await axios.request(
        create_last_interaction(company_object.id),
      );
      if (response2.status === 201) {
        console.log('Successfully created company last interaction field');
      }
    }
    if (company_interaction_status === undefined) {
      const response2 = await axios.request(
        create_interaction_status(company_object.id),
      );
      if (response2.status === 201) {
        console.log('Successfully created company interaction status field');
      }
    }
    if (person_last_interaction === undefined) {
      const response2 = await axios.request(
        create_last_interaction(person_object.id),
      );
      if (response2.status === 201) {
        console.log('Successfully created person last interaction field');
      }
    }
    if (person_interaction_status === undefined) {
      const response2 = await axios.request(
        create_interaction_status(person_object.id),
      );
      if (response2.status === 201) {
        console.log('Successfully created person interaction status field');
      }
    }

    // Extract the timestamp of message
    const messageDate = properties.after.receivedAt;
    const interactionStatus = calculateStatus(messageDate);

    // Get the details of person and related company
    const messageOptions = {
      method: 'GET',
      url: `${TWENTY_URL}/messages/${recordId}?depth=1`,
      headers: {
        Authorization: `Bearer ${TWENTY_API_KEY}`,
      },
    };
    const messageDetails = await axios.request(messageOptions);
    const peopleIds: string[] = [];
    for (const participant of messageDetails.data.messages
      .messageParticipants) {
      peopleIds.push(participant.personId);
    }

    const companiesIds = [];
    for (const id of peopleIds) {
      companiesIds.push(await fetchRelatedCompanyId(id));
    }
    // Update the field value depending on the timestamp
    for (const id of peopleIds) {
     await updateInteractionStatus("people", id, messageDate, interactionStatus);
    }

    for (const id of companiesIds) {
      await updateInteractionStatus("companies", id, messageDate, interactionStatus);
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(error.message);
      return {};
    }
    console.error(error);
    return {};
  }
};

export const config: FunctionConfig = {
  universalIdentifier: '683966a0-b60a-424e-86b1-7448c9191bde',
  name: 'test',
  triggers: [
    {
      universalIdentifier: 'f4f1e127-87f0-4dcf-99fe-8061adf5cbe6',
      type: 'databaseEvent',
      eventName: 'message.created',
    },
    {
      universalIdentifier: '4c17878f-b6b3-4d0a-8de6-967b1cb55002',
      type: 'databaseEvent',
      eventName: 'message.updated',
    },
  ],
};
