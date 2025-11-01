import axios from 'axios';

const TWENTY_API_URL: string = process.env.TWENTY_API_URL !== '' && process.env.TWENTY_API_URL !== undefined ? `${process.env.TWENTY_API_URL}/rest` : "";
const TWENTY_API_KEY: string = process.env.TWENTY_API_KEY !== '' && process.env.TWENTY_API_KEY !== undefined ? process.env.TWENTY_API_KEY : "";
const MAILCHIMP_API_URL: string = process.env.MAILCHIMP_URL !== '' && process.env.MAILCHIMP_URL !== undefined ? `https://${process.env.MAILCHIMP_URL}.api.mailchimp.com/3.0/` : "";
const MAILCHIMP_API_KEY: string = process.env.MAILCHIMP_API_KEY !== '' && process.env.MAILCHIMP_API_KEY != undefined ? process.env.MAILCHIMP_API_KEY : "";
const IS_EMAIL_CONSTRAINT: boolean = process.env.IS_EMAIL_CONSTRAINT == 'true';
const IS_COMPANY_CONSTRAINT: boolean = process.env.COMPANY_CONSTRAINT == 'true';
const IS_PHONE_CONSTRAINT: boolean = process.env.IS_PHONE_CONSTRAINT == 'true';
const IS_ADDRESS_CONSTRAINT: boolean = process.env.IS_ADDRESS_CONSTRAINT == 'true';
const MAILCHIMP_AUDIENCE_ID: string = process.env.MAILCHIMP_AUDIENCE_ID !== '' && process.env.MAILCHIMP_AUDIENCE_ID !== undefined ? process.env.MAILCHIMP_AUDIENCE_ID : "";

const fetchCompanyData = async (companyId: string): Promise<object> => {
  const options = {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${TWENTY_API_KEY}`,
    },
    url: `${TWENTY_API_URL}/company/${companyId}`,
  };
  const temp = await axios.request(options);
  return { name: temp.data.name, address: temp.data.address };
};

const checkAddress = (address: object): object => {
  if (
    address['addressStreet1'] !== '' &&
    address['addressCity'] !== '' &&
    address['addressPostCode'] !== '' &&
    address['addressState'] !== ''
  ) {
    return address;
  }
  return {
    street1: "",
    street2: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
  };
};

const checkAudiencePermissions = async (audienceId: string): Promise<string[]> => {
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
    return error;
  }
};

const prepareData = (email: string, phoneNumber: string, firstName: string, lastName: string, companyName: string, address: object): object => {
  const data = {};
  if (IS_EMAIL_CONSTRAINT) {
    data['email_channel'] = {
        email: email,
        marketing_consent: {
          status: "unknown"
      }
    }
  }
  if (IS_PHONE_CONSTRAINT) { //TODO: fix
    data['phone_number'] = {

    }
  }
  data['mergeFields'] = {
    FNAME: firstName,
    LNAME: lastName,
    ADDRESS: {
      addr1: address['addressStreet1'],
      addr2: address['addressStreet2'],
      city: address['addressCity'],
      state: address['addressState'],
      zip: address['addressPostCode'],
      country: address['addressCountry']
    },
    PHONE: phoneNumber,
    COMPANY: companyName,
  }
  return data;
}

export const main = async (params: {
  properties: Record<string, any>;
  recordId: string;
  userId: string;
}): Promise<object> => {
  if (!IS_EMAIL_CONSTRAINT && !IS_PHONE_CONSTRAINT) {
    console.log('Function exited as there are no constraints to email nor phone number');
    return {};
  }

  if (MAILCHIMP_API_URL === null || MAILCHIMP_API_KEY === null || MAILCHIMP_AUDIENCE_ID === null) {
    console.log('Missing Mailchimp required parameters');
    return {};
  }

  if (IS_COMPANY_CONSTRAINT && (TWENTY_API_KEY === null || TWENTY_API_URL === null)) {
    console.log('Missing Twenty related parameters');
    return {};
  }

  const { properties, recordId } = params;

  console.log(properties);
  console.log(recordId);


  const firstName: string = properties.after.name.firstName;
  const lastName: string = properties.after.name.lastName;
  const email: string = IS_EMAIL_CONSTRAINT && properties.after.emails.primaryEmail !== '' ? properties.after.emails.primaryEmail : null;
  const phoneNumber: string = IS_PHONE_CONSTRAINT && properties.after.phones.primaryPhoneNumber !== '' ? properties.after.phones.primaryPhoneNumber : null;
  const company: object = IS_COMPANY_CONSTRAINT ? await fetchCompanyData(properties.after.companyId) : null;
  const companyName: string = company['name'] !== '' ? company['name'] : null;
  const address: object = IS_ADDRESS_CONSTRAINT ? checkAddress(company['address']) : null;

  if (firstName === '' || lastName === '') {
    console.log('First or last name is empty');
    return {};
  }

  const audiencePermissions = await checkAudiencePermissions(MAILCHIMP_AUDIENCE_ID);

  if (IS_EMAIL_CONSTRAINT && audiencePermissions.includes("Email") && email === null) {
    console.log('Email is empty');
    return {};
  }

  if (IS_PHONE_CONSTRAINT && audiencePermissions.includes("SMS") && phoneNumber === null) { //TODO: fix
    console.log('Phone number is empty');
    return {};
  }

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${MAILCHIMP_API_KEY}`,
    },
    url: `${MAILCHIMP_API_URL}/audiences/${MAILCHIMP_AUDIENCE_ID}/contacts`,
    data: prepareData(email, phoneNumber, firstName, lastName, companyName, address)
  }
  try {
   const temp = await axios.request(options);
   if (temp.status === 200) {
     console.log("Person has been successfully added");
     return {};
   }
   console.log("Error"); //TODO: fix
    return temp;
  }
  catch (error) {
    console.error(error);
    return {};
  }
};
