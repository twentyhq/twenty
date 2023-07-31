import { IconBuildingSkyscraper } from '@tabler/icons-react';

import { CompanyChip } from '@/companies/components/CompanyChip';
import { EditableField } from '@/ui/editable-field/components/EditableField';
import { FieldContext } from '@/ui/editable-field/states/FieldContext';
import { RelationPickerHotkeyScope } from '@/ui/input/relation-picker/types/RelationPickerHotkeyScope';
import { RecoilScope } from '@/ui/utilities/recoil-scope/components/RecoilScope';
import { Company, Person } from '~/generated/graphql';
import { getLogoUrlFromDomainName } from '~/utils';

import { PeopleCompanyEditableFieldEditMode } from './PeopleCompanyEditableFieldEditMode';

export type OwnProps = {
  people: Pick<Person, 'id'> & {
    company?: Pick<Company, 'id' | 'name' | 'domainName'> | null;
  };
};

export function PeopleCompanyEditableField({ people }: OwnProps) {
  return (
    <RecoilScope SpecificContext={FieldContext}>
      <RecoilScope>
        <EditableField
          useEditButton
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
                pictureUrl={getLogoUrlFromDomainName(people.company.domainName)}
              />
            ) : (
              <></>
            )
          }
          isDisplayModeContentEmpty={!people.company}
          isDisplayModeFixHeight
        />
      </RecoilScope>
    </RecoilScope>
  );
}
