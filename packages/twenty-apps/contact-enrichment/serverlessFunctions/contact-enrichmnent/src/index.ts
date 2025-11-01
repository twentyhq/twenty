import axios from 'axios';

const TWENTY_API_KEY: string = process.env.TWENTY_API_KEY !== "" && process.env.TWENTY_API_KEY !== undefined ? process.env.TWENTY_API_KEY : "";
const TWENTY_API_URL: string = process.env.TWENTY_API_URL !== "" && process.env.TWENTY_API_URL !== undefined ? `${process.env.TWENTY_API_URL}/rest` : "";
const FULLENRICH_API_KEY: string = process.env.FULLENRICH_API_KEY !== "" && process.env.FULLENRICH_API_KEY !== undefined ? process.env.FULLENRICH_API_KEY : "";
const FULLENRICH_API_URL = 'https://app.fullenrich.com/api/v1/contact/enrich/bulk';

// 1. Read the properties of event (created|updated.company|person)
// 2. Check how many details are in record
// 3. If there are minimal details (person - linkedin or first + last name and linked company with either name or domain)
//    send a request to Fullenrich
// 4. Wait for webhook to send back information and send a request to Twenty to update person and/or company (via POST or PATCH)

// TODO: Add requirements after which request to Fullenrich will be sent

const createCompany = () => {
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TWENTY_API_KEY}`,
    },
    url: `${TWENTY_API_URL}/company?upsert=true`,
    data: {

    }
  }
};

const createPerson = () => {
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TWENTY_API_KEY}`,
    },
    url: `${TWENTY_API_URL}/person?upsert=true`,
    data: {}
  }
}

export const main = async (params: {
  properties: Record<string,any>;
  recordId: string;
  userId: string;
}): Promise<object> => {
  if (TWENTY_API_KEY == "" || TWENTY_API_URL == "" || FULLENRICH_API_KEY == "") {
    console.log("Missing parameters");
    return {};
  }

  const { properties, recordId, userId } = params;

  // Cases:
  // 1. Linkedin
  // 2. First and last name but no company
  // 3. Company name or company domain but no first last name

  // (first name && last name && (company name || company domain )) || linkedin
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
};