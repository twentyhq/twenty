import { IconBuildingSkyscraper } from '@tabler/icons-react';

import { CompanyChip } from '@/companies/components/CompanyChip';
import { EditableField } from '@/ui/editable-field/components/EditableField';
import { FieldContext } from '@/ui/editable-field/states/FieldContext';
import { RecoilScope } from '@/ui/recoil-scope/components/RecoilScope';
import { RelationPickerHotkeyScope } from '@/ui/relation-picker/types/RelationPickerHotkeyScope';
import { Company, Person } from '~/generated/graphql';
import { getLogoUrlFromDomainName } from '~/utils';

import { PeopleCompanyEditableFieldEditMode } from './PeopleCompanyEditableFieldEditMode';

export type OwnProps = {
  people: Pick<Person, 'id'> & {
    company?: Pick<Company, 'id' | 'name' | 'domainName'> | null;
  };
};

export function PeopleCompanyEditableField({ people }: OwnProps) {
  console.log({ people });
  return (
    <RecoilScope SpecificContext={FieldContext}>
      <RecoilScope>
        <EditableField
          customEditHotkeyScope={{
            scope: RelationPickerHotkeyScope.RelationPicker,
          }}
          iconLabel={<IconBuildingSkyscraper />}
          editModeContent={
            <PeopleCompanyEditableFieldEditMode people={people} />
          }
          displayModeContent={
            people.company ? (
              <CompanyChip
                id={people.company.id}
                name={people.company.name}
                picture={getLogoUrlFromDomainName(people.company.domainName)}
              />
            ) : (
              <></>
            )
          }
          isDisplayModeContentEmpty={!people.company}
        />
      </RecoilScope>
    </RecoilScope>
  );
}
