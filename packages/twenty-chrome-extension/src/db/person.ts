import { Person } from '~/db/types/person';

import handleQueryParams from '../utils/handleQueryParams';
import requestDb from '../utils/requestDb';

export const fetchPerson = async (personData: Person) => {
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
    const person: Person[] = res.data.people.edges.filter(
      (edge: any) =>
        edge.node.name.firstName === personData.name.firstName &&
        edge.node.name.lastName === personData.name.lastName,
    );
    if (person.length > 0) return person[0];
    else return null;
  }
};

export const createPerson = async (perosn: Person) => {
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
    return res.data.createPerson.id;
  }
};
