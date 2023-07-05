import { useCallback } from 'react';
import { getOperationName } from '@apollo/client/utilities';
import { v4 as uuidv4 } from 'uuid';

import { GET_PEOPLE } from '@/people/services';
import { useInsertPersonMutation } from '~/generated/graphql';

export function useCreatePerson() {
  const [insertPersonMutation] = useInsertPersonMutation();

  const createPerson = useCallback(async () => {
    await insertPersonMutation({
      variables: {
        id: uuidv4(),
        firstname: '',
        lastname: '',
        email: '',
        phone: '',
        createdAt: new Date().toISOString(),
        city: '',
      },
      refetchQueries: [getOperationName(GET_PEOPLE) ?? ''],
    });
  }, [insertPersonMutation]);

  return createPerson;
}
