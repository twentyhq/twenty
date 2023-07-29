import { useState } from 'react';

import { FieldContext } from '@/ui/editable-field/states/FieldContext';
import { RecoilScope } from '@/ui/recoil-scope/components/RecoilScope';
import { Person, useUpdateOnePersonMutation } from '~/generated/graphql';

import { InplaceInputDoubleText } from '../../../ui/inplace-input/components/InplaceInputDoubleText';

type OwnProps = {
  people: Pick<Person, 'id' | 'firstName' | 'lastName'>;
};

export function PeopleFullNameEditableField({ people }: OwnProps) {
  const [internalValueFirstName, setInternalValueFirstName] = useState(
    people.firstName,
  );
  const [internalValueLastName, setInternalValueLastName] = useState(
    people.lastName,
  );

  const [updatePeople] = useUpdateOnePersonMutation();

  async function handleChange(
    newValueFirstName: string,
    newValueLastName: string,
  ) {
    setInternalValueFirstName(newValueFirstName);
    setInternalValueLastName(newValueLastName);
    handleSubmit(newValueFirstName, newValueLastName);
  }

  async function handleSubmit(
    newValueFirstName: string,
    newValueLastName: string,
  ) {
    await updatePeople({
      variables: {
        where: {
          id: people.id,
        },
        data: {
          firstName: newValueFirstName ?? '',
          lastName: newValueLastName ?? '',
        },
      },
    });
  }

  return (
    <RecoilScope SpecificContext={FieldContext}>
      <InplaceInputDoubleText
        firstValuePlaceholder={'First name'}
        secondValuePlaceholder={'Last name'}
        firstValue={internalValueFirstName ?? ''}
        secondValue={internalValueLastName ?? ''}
        onChange={handleChange}
      />
    </RecoilScope>
  );
}
