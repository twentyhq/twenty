import { useEffect, useState } from 'react';

import { EditableField } from '@/ui/editable-field/components/EditableField';
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

  useEffect(() => {
    setInternalValueFirstName(people.firstName);
    setInternalValueLastName(people.lastName);
  }, [people.firstName, people.lastName]);

  async function handleChange(
    newValueFirstName: string,
    newValueLastName: string,
  ) {
    setInternalValueFirstName(newValueFirstName);
    setInternalValueLastName(newValueLastName);
  }

  async function handleSubmit() {
    await updatePeople({
      variables: {
        where: {
          id: people.id,
        },
        data: {
          firstName: internalValueFirstName ?? '',
          lastName: internalValueLastName ?? '',
        },
      },
    });
  }

  async function handleCancel() {
    setInternalValueFirstName(people.firstName);
    setInternalValueLastName(people.lastName);
  }

  return (
    <RecoilScope SpecificContext={FieldContext}>
      <EditableField
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        editModeContent={
          <InplaceInputDoubleText
            firstValuePlaceholder={'First name'}
            secondValuePlaceholder={'Last name'}
            firstValue={internalValueFirstName ?? ''}
            secondValue={internalValueLastName ?? ''}
            onChange={handleChange}
          />
        }
        displayModeContent={`${internalValueFirstName}  ${internalValueLastName}`}
        isDisplayModeContentEmpty={
          !(internalValueFirstName !== '') && !(internalValueLastName !== '')
        }
      />
    </RecoilScope>
  );
}
