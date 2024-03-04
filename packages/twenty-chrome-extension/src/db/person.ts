import handleQueryParams from '../utils/handleQueryParams';
import requestDb from '../utils/requestDb';

//eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyMDIwMjAyMC0xYzI1LTRkMDItYmYyNS02YWVjY2Y3ZWE0MTkiLCJpYXQiOjE3MDk1NzA4NDYsImV4cCI6MTcxMDg2Njg0MywianRpIjoiMGM1MjY2NGYtMGRjZC00YTg2LWI4ZWEtNTQ1NDg4YTczZGVlIn0.kUOwQ0p7GrYnATYsrSYxBFzGwtacnjE8fCHvWEdn6BM

export const fetchPerson = async (personData: any) => {
  const query = `
    query FindManyPeople {
      people {
        edges {
          node {
            name {
              firstName
              lastName
            }
          }
        }
      }
    }
  `;
  const res = await requestDb(query);
  if (res.errors) {
    throw Error(res.Errors);
  }
  if (res.data) {
    const person = res.data.people.edges.filter(
      (edge: any) =>
        edge.node.name.firstName === personData.name.firstName &&
        edge.node.name.lastName === personData.name.lastName,
    );
    if (person.length > 0) return person[0];
    else return null;
  }
};

export const createPerson = async (perosn: any) => {
  const query = `
    mutation CreateOnePerson {
      createPerson(data:{${handleQueryParams(perosn)}})
      {id}
    }
  `;
  const res = await requestDb(query);
  if (res.errors) {
    throw Error(res.Errors);
  }
  if (res.data) {
    return res;
  }
};
