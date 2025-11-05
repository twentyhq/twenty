import axios from 'axios';
import { type ServerlessFunctionConfig } from 'twenty-sdk/application';

const TWENTY_API_KEY: string = process.env.TWENTY_API_KEY ?? '';
const TWENTY_API_URL: string =
  process.env.TWENTY_API_URL !== '' && process.env.TWENTY_API_URL !== undefined
    ? `${process.env.TWENTY_API_URL}/rest`
    : 'https://api.twenty.com/rest';
const STRIPE_API_KEY: string = process.env.STRIPE_API_KEY ?? '';
const STRIPE_API_URL: string = 'https://api.stripe.com/v1/customers';

enum stripeStatus {
  Incomplete = 'INCOMPLETE',
  IncompleteExpired = 'INCOMPLETE_EXPIRED',
  Trialing = 'TRIALING',
  Active = 'ACTIVE',
  PastDue = 'PAST_DUE',
  Canceled = 'CANCELED',
  Unpaid = 'UNPAID',
  Paused = 'PAUSED',
}

type stripeData = {
  quantity: number;
};

type stripeItems = {
  data: stripeData[];
};

type stripeResponse = {
  customer: string;
  items: stripeItems;
  status: stripeStatus;
  type: string;
};

type stripeCustomer = {
  businessName: string;
};

type twentyObject = {
  id: string;
  nameSingular: string;
  fields: Record<string, any>[];
};

const getCompaniesObject = async (): Promise<twentyObject | undefined> => {
  const options = {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${TWENTY_API_KEY}`,
    },
    url: `${TWENTY_API_URL}/metadata/objects`,
  };
  try {
    const response = await axios.request(options);
    if (response.status === 200) {
      const companyObject = response.data.data.objects.find(
        (object: twentyObject) => object.nameSingular === 'company',
      );
      return (companyObject as twentyObject) ?? ({} as twentyObject);
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error;
    }
  }
};

const createFields = async (objectId: string, fieldName: string) => {
  const data =
    fieldName === 'seats'
      ? {
          type: 'NUMBER',
          objectMetadataId: objectId,
          name: 'seats',
          label: 'Seats',
        }
      : {
          type: 'SELECT',
          objectMetadataId: objectId,
          name: 'subStatus',
          label: 'Sub Status',
          options: [
            {
              color: 'iris',
              label: 'Incomplete',
              value: stripeStatus.Incomplete,
              position: 1,
            },
            {
              color: 'sky',
              label: 'Incomplete (expired)',
              value: stripeStatus.IncompleteExpired,
              position: 2,
            },
            {
              color: 'amber',
              label: 'Trialing',
              value: stripeStatus.Trialing,
              position: 3,
            },
            {
              color: 'green',
              label: 'Active',
              value: stripeStatus.Active,
              position: 4,
            },
            {
              color: 'orange',
              label: 'Past due',
              value: stripeStatus.PastDue,
              position: 5,
            },
            {
              color: 'brown',
              label: 'Canceled',
              value: stripeStatus.Canceled,
              position: 6,
            },
            {
              color: 'red',
              label: 'Unpaid',
              value: stripeStatus.Unpaid,
              position: 7,
            },
            {
              color: 'gray',
              label: 'Paused',
              value: stripeStatus.Paused,
              position: 8,
            },
          ],
        };

  const options = {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${TWENTY_API_KEY}`,
      'Content-Type': 'application/json',
    },
    url: `${TWENTY_API_URL}/metadata/fields`,
    data: data,
  };
  try {
    const response = await axios(options);
    return response.status === 201;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error;
    }
  }
};

const getStripeCustomerData = async (
  customerID: string,
): Promise<stripeCustomer | undefined> => {
  const options = {
    method: 'GET',
    url: `${STRIPE_API_URL}/${customerID}`,
    auth: {
      username: STRIPE_API_KEY,
      password: '',
    },
  };
  try {
    const response = await axios(options);
    return response.status === 200
      ? (response.data as stripeCustomer)
      : ({} as stripeCustomer);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error;
    }
  }
};

const checkIfCompanyExistsInTwenty = async (name: string | undefined) => {
  if (!name) {
    return {};
  }
  const options = {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${TWENTY_API_KEY}`,
    },
    url: `${TWENTY_API_URL}/companies?filter=name%5Beq%5D%3A%22${name}%22`,
  };
  try {
    const response = await axios(options);
    return response.status === 200 && response.data.data.companies.length > 0
      ? response.data.data.companies[0]
      : {};
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error;
    }
  }
};

const updateTwentyCompany = async (
  companyId: string,
  seats: number,
  subStatus: stripeStatus,
): Promise<boolean | undefined> => {
  const options = {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${TWENTY_API_KEY}`,
      'Content-Type': 'application/json',
    },
    url: `${TWENTY_API_URL}/companies/${companyId}`,
    data: {
      seats: seats,
      subStatus: subStatus,
    },
  };
  try {
    const response = await axios(options);
    return response.status === 200;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error;
    }
  }
};

const createTwentyCustomer = async (
  customerName: string | undefined,
  seats: number,
  subStatus: string,
) => {
  const options = {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${TWENTY_API_KEY}`,
      'Content-Type': 'application/json',
    },
    url: `${TWENTY_API_URL}/companies`,
    data: {
      name: customerName,
      seats: seats,
      subStatus: subStatus,
    },
  };
  try {
    const response = await axios(options);
    return response.status === 201 ? response.data : {};
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error;
    }
  }
};

export const main = async (params: {
  properties: unknown;
}): Promise<object | undefined> => {
  if (TWENTY_API_KEY === '' || STRIPE_API_KEY === '') {
    console.warn('Missing variables');
    return {};
  }

  try {
    // TODO: add validation of signature key from Stripe
    const { properties } = params;
    const stripe = properties as stripeResponse;
    const allowed_types = [
      'customer.subscription.created',
      'customer.subscription.updated',
    ];
    if (!allowed_types.includes(stripe.type)) {
      console.error('Wrong webhook');
      return {};
    }

    const companyObject = await getCompaniesObject();
    if (
      companyObject?.fields.find((field) => field.name === 'seats') ===
      undefined
    ) {
      const t: boolean | undefined = companyObject?.id
        ? await createFields(companyObject?.id, 'seats')
        : false;
      if (t === false) {
        console.error('Seats field creation failed');
        return {};
      }
    }
    if (
      companyObject?.fields.find((field) => field.name === 'subStatus') ===
      undefined
    ) {
      const t: boolean | undefined = companyObject?.id
        ? await createFields(companyObject?.id, 'subStatus')
        : false;
      if (t === false) {
        console.error('Sub status field creation failed');
        return {};
      }
    }

    const stripeCustomer = await getStripeCustomerData(stripe.customer);
    if (stripeCustomer?.businessName) {
      console.warn('Set customer business name in Stripe');
      return {};
    }
    const twentyCustomer = await checkIfCompanyExistsInTwenty(
      stripeCustomer?.businessName,
    );
    if (Object.keys(twentyCustomer).length === 0) {
      const a = await createTwentyCustomer(
        stripeCustomer?.businessName,
        stripe.items.data[0].quantity,
        stripe.status.toUpperCase(),
      );
      if (Object.keys(a).length === 0) {
        console.error('Creation of Stripe customer in Twenty failed');
        return {};
      }
    } else {
      const a = await updateTwentyCompany(
        twentyCustomer.id,
        stripe.items.data[0].quantity,
        stripe.status.toUpperCase() as stripeStatus,
      );
      if (!a) {
        console.error('Update of Stripe customer in Twenty failed');
        return {};
      }
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(error.message);
    }
    console.error(error);
    return {};
  }
};

export const config: ServerlessFunctionConfig = {
  universalIdentifier: 'cd15a738-18a5-406e-8b83-959dc52ebe14',
  name: 'stripe',
  triggers: [
    {
      universalIdentifier: '55f58e19-d832-43c4-9f8b-3f29fc05c162',
      type: 'route',
      path: '/stripe',
      httpMethod: 'POST',
      isAuthRequired: false,
    },
  ],
};
