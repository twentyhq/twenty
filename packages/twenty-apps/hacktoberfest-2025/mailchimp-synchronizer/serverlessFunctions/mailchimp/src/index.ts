import axios from 'axios';
import { type ServerlessFunctionConfig } from 'twenty-sdk/application';

const TWENTY_API_URL: string =
  process.env.TWENTY_API_URL !== '' && process.env.TWENTY_API_URL !== undefined
    ? `${process.env.TWENTY_API_URL}/rest`
    : 'https://api.twenty.com/rest';
const TWENTY_API_KEY: string = process.env.TWENTY_API_KEY ?? '';
const MAILCHIMP_API_URL: string =
  process.env.MAILCHIMP_URL !== '' && process.env.MAILCHIMP_URL !== undefined
    ? `https://${process.env.MAILCHIMP_URL}.api.mailchimp.com/3.0/`
    : '';
const MAILCHIMP_API_KEY: string = process.env.MAILCHIMP_API_KEY ?? '';
const MAILCHIMP_AUDIENCE_ID: string = process.env.MAILCHIMP_AUDIENCE_ID ?? '';
const IS_EMAIL_CONSTRAINT: boolean = process.env.IS_EMAIL_CONSTRAINT == 'true';
const IS_COMPANY_CONSTRAINT: boolean = process.env.COMPANY_CONSTRAINT == 'true';
const IS_PHONE_CONSTRAINT: boolean = process.env.IS_PHONE_CONSTRAINT == 'true';
const IS_ADDRESS_CONSTRAINT: boolean =
  process.env.IS_ADDRESS_CONSTRAINT == 'true';

type mailchimpAddress = {
  street1: string;
  street2: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
};

type twentyAddress = {
  addressStreet1: string;
  addressStreet2: string;
  addressCity: string;
  addressState: string;
  addressPostCode: string;
  addressCountry: string;
};

type twentyPerson = {
  name: {
    firstName: string;
    lastName: string;
  };
  email: {
    primaryEmail: string;
  };
  phones: {
    primaryPhoneNumber: string;
    primaryPhoneCallingCode: string;
  };
  companyId: string;
};

const fetchCompanyData = async (companyId: string): Promise<object> => {
  const options = {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${TWENTY_API_KEY}`,
    },
    url: `${TWENTY_API_URL}/company/${companyId}`,
  };
  try {
    const temp = await axios.request(options);
    return {
      name: temp.data.name as string,
      address: temp.data.address as twentyAddress,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error;
    }
    throw error;
  }
};

const checkAddress = (address: twentyAddress): mailchimpAddress => {
  if (
    address.addressStreet1 !== '' &&
    address.addressCity !== '' &&
    address.addressPostCode !== '' &&
    address.addressState !== ''
  ) {
    return {
      street1: address.addressStreet1,
      street2: address.addressStreet2,
      city: address.addressCity,
      state: address.addressState,
      zipCode: address.addressPostCode,
      country: address.addressCountry,
    } as mailchimpAddress;
  }
  throw new Error('Invalid address');
};

const checkAudiencePermissions = async (
  audienceId: string,
): Promise<string[]> => {
  const options = {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${MAILCHIMP_API_KEY}`,
    },
    url: `${MAILCHIMP_API_URL}/audiences/${audienceId}`,
  };
  try {
    const temp = await axios.request(options);
    return temp.data.enabled_channels;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error;
    }
    throw error;
  }
};

const prepareData = (
  firstName: string,
  lastName: string,
  email: string,
  phoneNumber: string,
  phoneCallingCode: string,
  companyName: string,
  address: mailchimpAddress | null,
): object => {
  const data = {} as any;
  if (IS_EMAIL_CONSTRAINT) {
    data['email_channel'] = {
      email: email,
      marketing_consent: {
        status: 'unknown',
      },
    };
  }
  data['mergeFields'] = {
    FNAME: firstName,
    LNAME: lastName,
  };
  if (IS_ADDRESS_CONSTRAINT) {
    data['mergeFields']['ADDRESS'] = address;
  }
  if (IS_PHONE_CONSTRAINT) {
    const mergedPhoneNumber: string = phoneCallingCode.startsWith('+')
      ? phoneCallingCode.concat(phoneNumber)
      : '+'.concat(phoneCallingCode, phoneNumber);
    data['sms_channel'] = {
      sms_phone: mergedPhoneNumber,
      marketing_consent: {
        status: 'unknown',
      },
    };
    data['mergeFields']['PHONE'] = mergedPhoneNumber;
  }
  if (IS_COMPANY_CONSTRAINT) {
    data['mergeFields']['COMPANY'] = companyName;
  }
  return data;
};

export const main = async (params: {
  properties: Record<string, any>;
  recordId: string;
  userId: string;
}): Promise<object> => {
  if (!IS_EMAIL_CONSTRAINT && !IS_PHONE_CONSTRAINT) {
    console.log(
      'Function exited as there are no constraints to email nor phone number',
    );
    return {};
  }

  if (
    MAILCHIMP_API_URL === '' ||
    MAILCHIMP_API_KEY === '' ||
    MAILCHIMP_AUDIENCE_ID === ''
  ) {
    console.log('Missing Mailchimp required parameters');
    return {};
  }

  if (IS_COMPANY_CONSTRAINT && TWENTY_API_KEY === '') {
    console.log('Missing Twenty related parameters');
    return {};
  }

  try {
    const { properties, recordId } = params;

    console.log(properties);
    console.log(recordId);

    const twentyRecord: twentyPerson = properties as twentyPerson;
    const email: boolean =
      IS_EMAIL_CONSTRAINT && twentyRecord.email.primaryEmail !== '';
    const phoneNumber: boolean =
      IS_PHONE_CONSTRAINT &&
      twentyRecord.phones.primaryPhoneNumber !== '' &&
      twentyRecord.phones.primaryPhoneCallingCode !== '';
    const company: any = IS_COMPANY_CONSTRAINT
      ? await fetchCompanyData(properties.after.companyId)
      : null;
    const companyName: string = company['name'] !== '' ? company['name'] : null;
    const address: mailchimpAddress | null = IS_ADDRESS_CONSTRAINT
      ? checkAddress(company['address'])
      : null;

    if (
      twentyRecord.name.firstName === '' ||
      twentyRecord.name.lastName === ''
    ) {
      console.error('First or last name is empty');
      return {};
    }

    const audiencePermissions: string[] = await checkAudiencePermissions(
      MAILCHIMP_AUDIENCE_ID,
    );

    if (
      IS_EMAIL_CONSTRAINT &&
      audiencePermissions.includes('Email') &&
      !email
    ) {
      console.error('Email is empty');
      return {};
    }

    if (
      IS_PHONE_CONSTRAINT &&
      audiencePermissions.includes('SMS') &&
      !phoneNumber
    ) {
      console.error('Phone number is empty');
      return {};
    }

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${MAILCHIMP_API_KEY}`,
      },
      url: `${MAILCHIMP_API_URL}/audiences/${MAILCHIMP_AUDIENCE_ID}/contacts`,
      data: prepareData(
        twentyRecord.name.firstName,
        twentyRecord.name.lastName,
        twentyRecord.email.primaryEmail,
        twentyRecord.phones.primaryPhoneNumber,
        twentyRecord.phones.primaryPhoneCallingCode,
        companyName,
        address,
      ),
    };
    const temp = await axios.request(options);
    if (temp.status === 200) {
      console.log('Person has been successfully added');
      return {};
    } else {
      throw temp;
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

export const config: ServerlessFunctionConfig = {
  universalIdentifier: '83319670-775b-4862-b133-5c353e594151',
  name: 'mailchimp-synchronizer',
  triggers: [
    {
      universalIdentifier: 'e627ff6f-0a0c-48b2-bdbb-31967489ec96',
      type: 'databaseEvent',
      eventName: 'person.created',
    },
  ],
};
