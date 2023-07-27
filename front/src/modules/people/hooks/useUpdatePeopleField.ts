import { useUpdateOnePersonMutation } from '~/generated/graphql';

export function useUpdatePeopleField() {
  const [updatePeople] = useUpdateOnePersonMutation();

  return function updatePeopleField(
    peopleId: string,
    fieldName: string,
    fieldValue: unknown,
  ) {
    updatePeople({
      variables: {
        where: { id: peopleId },
        data: { [fieldName]: fieldValue },
      },
    });
  };
}
