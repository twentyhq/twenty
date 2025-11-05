import axios from "axios";

const company = "Company"
const KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyMDIwMjAyMC0xYzI1LTRkMDItYmYyNS02YWVjY2Y3ZWE0MTkiLCJ0eXBlIjoiQVBJX0tFWSIsIndvcmtzcGFjZUlkIjoiMjAyMDIwMjAtMWMyNS00ZDAyLWJmMjUtNmFlY2NmN2VhNDE5IiwiaWF0IjoxNzYyMjkwMjM0LCJleHAiOjQ5MTU4ODY2MzMsImp0aSI6ImVmMzQzMGM4LTE2MTgtNGY5Ny04OTU5LTIwMWJmNzk0ZjQwZCJ9.GzAYeVw9dg3BU7-WMFaz-3A3F-iRGzb96LpztVcieYA";
const URL = "http://localhost:3000/graphql";
const graphQLQuery = `mutation UpdateOne${company}($idToUpdate: UUID!, $input: ${company}UpdateInput!) {
  update${company}(id: $idToUpdate, data: $input) {
    id
    updatedById
  }
}`;
const recordId = 'd8d8a28f-247c-4b82-9222-64a29bd2474e';
const userId = '20202020-0687-4c41-b707-ed1bfca972a7';
const variables = {
  "idToUpdate": recordId,
  "input": {
    "updatedById": userId
  }
}
const options = {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${KEY}`,
  },
  url: URL,
  data: {
    query: graphQLQuery,
    variables: variables,
  }
}
const temp = async () => {
  try {
    console.log(graphQLQuery);
    console.log(variables);
    const response = await axios.request(options);
    console.log(response.data);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.log(error.message);
    }
    console.log(error);
  }
};
temp();