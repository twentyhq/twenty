import axios from 'axios';

const TWENTY_API_KEY: string = process.env.TWENTY_API_KEY ?? "";
const TWENTY_API_URL: string = process.env.TWENTY_API_URL !== "" && process.env.TWENTY_API_URL !== undefined ? `${process.env.TWENTY_API_URL}/rest` : "";
const FULLENRICH_API_KEY: string = process.env.FULLENRICH_API_KEY ?? "";
const FULLENRICH_API_URL = 'https://app.fullenrich.com/api/v1/contact/enrich/bulk';

// 1. Read the properties of event (created|updated.company|person)
// 2. Check how many details are in record
// 3. If there are minimal details (person - linkedin or first + last name and linked company with either name or domain)
//    send a request to Fullenrich
// 4. Wait for webhook to send back information and send a request to Twenty to update person and/or company (via POST or PATCH)

// TODO: Add requirements after which request to Fullenrich will be sent

type fullenrichPersonEmails = {
  email: string;
  status: string;
}

type fullenrichPersonPhoneNumber = {
  number: string;
  region: string;
}

type fullenrichPersonSocialMedia = {
  url: string;
  type: string;
}

type fullenrichCompanyAddress = {
  region: string;
  city: string;
  country: string;
  countryCode: string;
  postalCode: string;
  address_line_1: string;
  address_line_2: string;
}

type fullenrichCompany = {
  linkedin_url: string;
  name: string;
  website: string;
  domain: string;
  headquarters: fullenrichCompanyAddress;
}

type fullenrichPersonLinkedinProfilePosition = {
  title: string;
  company: fullenrichCompany;
}

type fullenrichPersonLinkedinProfile = {
  linkedin_url: string;
  linkedin_handle: string;
  location: string;
  summary: string;
  position: fullenrichPersonLinkedinProfilePosition;
}

type fullenrichPerson = {
  firstname: string;
  lastname: string;
  most_probable_email: string;
  most_probable_email_status: string;
  most_probable_phone: string;
  emails: fullenrichPersonEmails[];
  phones: fullenrichPersonPhoneNumber[];
  social_medias: fullenrichPersonSocialMedia[];
  profile: fullenrichPersonLinkedinProfile;
}

type twentyDomainName = {
  primaryLinkLabel: string;
  primaryLinkUrl: string;
}

type twentyAddress = {
  addressStreet1: string;
  addressStreet2: string;
  addressCity: string;
  addressCountry: string;
  addressPostCode: string;
  addressState: string;
}

type twentyCompany = {
  id?: string;
  name: string;
  domainName: twentyDomainName;
  employees: number | null;
  linkedinLink: twentyDomainName;
  address: twentyAddress;
}

type twentyPersonName = {
  firstName: string;
  lastName: string;
}

type twentyPersonSocialMedia = {
  primaryLinkLabel: string;
  primaryLinkUrl: string;
}

type twentyPersonEmail = {
  primaryEmail: string;
  additionalEmails: string[] | null;
}

type twentyPersonPhones = {
  primaryPhoneNumber: string;
  primaryPhoneCallingCode: string;
  primaryPhoneCountryCode: string;
  additionalPhones: string[] | null;
}

type twentyPerson = {
  id?: string;
  name: twentyPersonName;
  emails: twentyPersonEmail;
  linkedinLink: twentyPersonSocialMedia;
  xLink: twentyPersonSocialMedia;
  jobTitle: string;
  phones: twentyPersonPhones;
  city: string;
  intro: string;
  companyId: string | null;
}

const createCompany = async (companyData: twentyCompany): Promise<string> => {
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TWENTY_API_KEY}`,
    },
    url: `${TWENTY_API_URL}/company?upsert=true`,
    data: companyData
  };
    try {
      const response = await axios.request(options);
      return response.data.data.id;
    }
    catch (error) {
      if (axios.isAxiosError(error)) {
        throw error;
      }
      throw error;
    }
  };

const createPerson = async (personData: twentyPerson): Promise<boolean> => {
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TWENTY_API_KEY}`,
    },
    url: `${TWENTY_API_URL}/person?upsert=true`,
    data: personData
  }
  try {
    const response = await axios.request(options);
    return response.status === 201;
  }
  catch (error) {
    if (axios.isAxiosError(error)) {
      throw error;
    }
    throw error;
  }
}

const findLinkedPerson = async (companyId: string): Promise<twentyPerson[]> => {
  const options = {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${TWENTY_API_KEY}`,
    },
    url: `${TWENTY_API_URL}/people?filter=companyId%5Beq%5D%3A%22${companyId}`,
    };
    try {
      const response = await axios.request(options);
      if (response.status === 201) {
        return response.data.data.people; // there can be more than 1 person record or none
      }
    }
    catch (error) {
      if (axios.isAxiosError(error)) {
        throw error;
      }
      throw error;
    }
  }

const sendRequestToFullenrich = async (data: object): Promise<boolean> => {
  const options = {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${TWENTY_API_KEY}`,
      'Content-Type': 'application/json',
    },
    url: FULLENRICH_API_URL,
    data: data,
  }
  try {
    const response = await axios.request(options);
    return response.status === 201;
  }
  catch (error) {
    if (axios.isAxiosError(error)) {
      throw error;
    }
    throw error;
  }
}

export const main = async (params: {
  properties: Record<string, any>
  recordId?: string;
  userId?: string;
}): Promise<object> => {
  if (TWENTY_API_KEY == "" || FULLENRICH_API_KEY == "") {
    console.log("Missing parameters");
    return {};
  }

  try {
    const { properties, recordId} = params;
    if (recordId === undefined) {
      const input: fullenrichPerson = { // map to fullenrich record
        firstname: properties.firstname,
        lastname: properties.lastname,
        most_probable_email: properties.most_probable_email,
        most_probable_email_status: properties.most_probable_email_status,
        most_probable_phone: properties.most_probable_phone,
        emails: properties.emails,
        phones: properties.phones,
        social_medias: properties.social_medias,
        profile: properties.profile
      };
      const companyId: string = await createCompany({} as twentyCompany);
      const mails: string[] | null = input.emails.map(email => {["DELIVERABLE", "HIGH_PROBABILITY"].includes(email.status) ? email.email : null}); // get all emails which
      const linkedinLink: twentyPersonSocialMedia = {};
      const xLink: twentyPersonSocialMedia = {};
      await createPerson({
        name: {firstName: input.firstname, lastName: input.lastname},
        emails: {primaryEmail: input.most_probable_email, additionalEmails: mails},
        linkedinLink: input.social_medias, //TODO: find social_medias with LINKEDIN type
        xLink: properties.xLink, //TODO: find social_medias with TWITTER type
        jobTitle: input.profile.position.title,
        phones: {},
        city: input.profile.location,
        intro: input.profile.summary,
        companyId: companyId,
      } as twentyPerson);
    }
    else {
      if (properties.after.companyId === null) { // map to twenty person record
        const input: twentyPerson = {
          id: recordId,
          name: properties.after.name,
          emails: properties.after.emails,
          linkedinLink: properties.after.linkedinLink,
          xLink: properties.after.xLink,
          jobTitle: properties.after.jobTitle,
          phones: properties.after.phones,
          city: properties.after.city,
          intro: properties.after.intro,
          companyId: properties.after.companyId,
        }
        if (input.linkedinLink.primaryLinkUrl === "" && input.companyId === null){
          console.error()
          return {};
        }
      }
      else { // map to twenty company record
        const input: twentyCompany = {
          id: recordId,
          name: properties.after.name,
          domainName: properties.after.domainName,
          employees: properties.after.employees,
          linkedinLink: properties.after.linkedinLink,
          address: properties.after.address,
        }
        if (input.domainName.primaryLinkUrl === "" && input.name === "") {
          console.error("No company name or website");
          return {};
        }
        const linkedPeople: twentyPerson[] = await findLinkedPerson(input.id);
        if (linkedPeople.length === 0) {
          console.error("No linked people");
          return {};
        }
        for (const people of linkedPeople) {

        }
      }
    }

    const firstName: string = properties.after.name.firstName;
    const lastName: string = properties.after.name.lastName;
    const companyId: string = properties.after.companyId;
    const personLinkedIn: string = properties.after.linkedin.primaryLinkUrl;

    const emails: string[] = properties.after.emails.map((email: string) => {}) // TODO: fix
    const phoneNumbers: string[] = properties.after.phoneNumbers.map((email: string) => {}) // TODO: fix
    const x: string = properties.after.x;
    const jobTitle: string = properties.after.jobTitle;
    const intro: string = properties.after.intro;

    const companyName: string = properties.after.name;
    const domain: string = properties.after.domainName.primaryLinkUrl;
    const peopleId: string[] = [];
    const address: object = properties.after.address;
    const employees: number = properties.after.employees;
    const companyLinkedIn: string = properties.after.linkedin.primaryLinkUrl;


    if (companyId !== undefined) {
      const options = {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${TWENTY_API_KEY}`,
        }
      }
    }

    if ((firstName !== undefined && lastName !== undefined && companyId !== undefined) || personLinkedIn !== undefined) {
      const options = {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          Authorization: `Bearer ${TWENTY_API_KEY}`,
        }
      }
    }
    return {  };
  }
  catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(error.message);
      return {};
    }
    console.log(error);
    return {};
  }
};