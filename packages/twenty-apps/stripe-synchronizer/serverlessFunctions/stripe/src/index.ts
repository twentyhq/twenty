import axios from 'axios';

const TWENTY_API_KEY: string = process.env.TWENTY_API_KEY !== "" && process.env.TWENTY_API_KEY !== undefined ? process.env.TWENTY_API_KEY : "";
const TWENTY_API_URL: string = process.env.TWENTY_API_URL !== "" && process.env.TWENTY_API_URL !== undefined ? `${process.env.TWENTY_API_URL}/rest` : "https://api.twenty.com/rest";
const STRIPE_API_KEY: string = process.env.STRIPE_API_KEY !== "" && process.env.STRIPE_API_KEY !== undefined ? process.env.STRIPE_API_KEY : "";
const STRIPE_API_URL: string = "https://api.stripe.com/v1/customers";

const getCompaniesObject = async () => {
  const options = {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${TWENTY_API_KEY}`,
    },
    url: `${TWENTY_API_URL}/metadata/objects`,
  }
  try {
  const response = await axios.request(options);
  return response.status === 200 ? response.data.data.objects.find(object => object.nameSingular==="company") : {};
 }
 catch (error) {
    console.error(error);
    return {};
 }
}

const createFields = async (objectId: string, fieldName: string) => {
  const data = fieldName === "seats" ? {
    type: "NUMBER",
    objectMetadataId: objectId,
    name: "seats",
    label: "Seats"
  } : {
    type: "SELECT",
    objectMetadataId: objectId,
    name: "subStatus",
    label: "Sub Status",
    options: [
      {
        color: "iris",
        label: "Incomplete",
        value: "INCOMPLETE",
        position: 1
      },
      {
        color: "sky",
        label: "Incomplete (expired)",
        value: "INCOMPLETE_EXPIRED",
        position: 2
      },
      {
        color: "amber",
        label: "Trialing",
        value: "TRIALING",
        position: 3
      },
      {
        color: "green",
        label: "Active",
        value: "ACTIVE",
        position: 4
      },
      {
        color: "orange",
        label: "Past due",
        value: "PAST_DUE",
        position: 5
      },
      {
        color: "brown",
        label: "Canceled",
        value: "CANCELED",
        position: 6
      },
      {
        color: "red",
        label: "Unpaid",
        value: "UNPAID",
        position: 7
      },
      {
        color: "gray",
        label: "Paused",
        value: "PAUSED",
        position: 8
      }
    ]
  };

  const options = {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${TWENTY_API_KEY}`,
      'Content-Type': 'application/json',
    },
    url: `${TWENTY_API_URL}/metadata/fields`,
    data: data
  }
  try {
    const response = await axios(options);
    return response.status === 200;
  }
  catch (error) {
    console.error(error);
    return false;
  }
}

const getStripeCustomerData = async (customerID: string) => {
  const options = {
    method: 'GET',
    url: `${STRIPE_API_URL}/v1/customers/${customerID}`,
    auth: {
      username: STRIPE_API_KEY,
      password: ""
    }
  }
  try {
  const response = await axios(options);
  return response.status === 200 ? response.data : {};
  }
  catch (error) {
    console.log(error);
    return {};
  }
}

const checkIfCompanyExistsInTwenty = async (name: string) => {
  const options = {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${TWENTY_API_KEY}`,
    },
    url: `${TWENTY_API_URL}/customers?filter=name%5Beq%5D%3A%22${name}%22`,
  }
  try {
    const response = await axios(options);
    return (response.status === 200 && response.data.data.companies.length > 0) ? response.data.data.companies[0] : {};
  }
  catch (error) {
    console.error(error);
    return {};
  }
}

const updateTwentyCompany = async (customerID: string, seats: number, subStatus: string) => {
  const options = {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${TWENTY_API_KEY}`,
      'Content-Type': 'application/json',
    },
    url: `${TWENTY_API_URL}/customers/${customerID}`,
    data: {
      seats: seats,
      subStatus: [`${subStatus}`],
    }
  }
  try {
    const response = await axios(options);
    return response.status === 200;
  }
  catch (error) {
    console.error(error);
    return false;
  }
}

const createTwentyCustomer = async (customerName: string, seats: number, subStatus: string) => {
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
      subStatus: [`${subStatus}`]
    }
  };
  try {
    const response = await axios(options);
    return response.status === 200 ? response.data : {};
  }
  catch (error) {
    console.error(error);
    return {};
  }
}

export const main = async (params: {
  properties: Record<string, any>
}): Promise<object> => {
  if (TWENTY_API_KEY === "" || STRIPE_API_KEY === "") {
    console.log("Missing variables");
    return {};
  }

  const { properties } = params;
  const allowed_types = ["customer.subscription.created", "customer.subscription.updated"];
  if (!allowed_types.includes(properties.type)) {
    console.log("Wrong webhook");
    return {};
  }

  const companyObject = await getCompaniesObject();
  if (companyObject.fields.find(field => field.name==="seats") === undefined) {
    const t = await createFields(companyObject.id,"seats");
    if (t == false) {
      console.log("Seats field creation failed");
      return {};
    }
  }
  if (companyObject.fields.find(field => field.name==="subStatus") === undefined) {
    const t = await createFields(companyObject.id,"subStatus");
    if (t == false) {
      console.log("Sub status field creation failed");
      return {};
    }
  }

  const stripeCustomer = await getStripeCustomerData(properties.data.customer);
  const customerName: string = stripeCustomer.businessName;
  if (customerName === undefined) {
    console.log("Set customer business name in Stripe");
    return {};
  }
  const twentyCustomer = await checkIfCompanyExistsInTwenty(stripeCustomer.businessName);
  if (Object.keys(twentyCustomer).length === 0){
    const a = await createTwentyCustomer(stripeCustomer.businessName, properties.data.quantity, properties.data.status.toUpperCase());
    if (Object.keys(a).length === 0){
      console.log("Creation of Stripe customer in Twenty failed");
      return {};
    }
  }
  else {
    const a = await updateTwentyCompany(twentyCustomer.id, properties.data.quantity, properties.data.status.toUpperCase());
    if (!a) {
      console.log("Update of Stripe customer in Twenty failed");
      return {};
    }
  }

  // Retrieve webhook
  // Check if it's either subscription created or updated
  // Read customer ID, status and quantity
  // Read customer data
  // Check if customer company exists in Twenty, if not, create it
  // Check if related person exists in Twenty, if not, create it and link to company

};