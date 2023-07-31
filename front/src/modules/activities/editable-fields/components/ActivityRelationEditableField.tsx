import styled from '@emotion/styled';

import { CompanyChip } from '@/companies/components/CompanyChip';
import { PersonChip } from '@/people/components/PersonChip';
import { EditableField } from '@/ui/editable-field/components/EditableField';
import { FieldContext } from '@/ui/editable-field/states/FieldContext';
import { IconArrowUpRight } from '@/ui/icon';
import { RelationPickerHotkeyScope } from '@/ui/input/relation-picker/types/RelationPickerHotkeyScope';
import { RecoilScope } from '@/ui/utilities/recoil-scope/components/RecoilScope';
import {
  Activity,
  ActivityTarget,
  useGetCompaniesQuery,
  useGetPeopleQuery,
} from '~/generated/graphql';
import { getLogoUrlFromDomainName } from '~/utils';

import { ActivityRelationEditableFieldEditMode } from './ActivityRelationEditableFieldEditMode';

const StyledDisplayModeContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing(1)};
`;

type OwnProps = {
  activity?: Pick<Activity, 'id'> & {
    activityTargets?: Array<
      Pick<ActivityTarget, 'id' | 'commentableId' | 'commentableType'>
    > | null;
  };
};

export function ActivityRelationEditableField({ activity }: OwnProps) {
  const { data: targetPeople } = useGetPeopleQuery({
    variables: {
      where: {
        id: {
          in: activity?.activityTargets
            ? activity?.activityTargets
                .filter((target) => target.commentableType === 'Person')
                .map((target) => target.commentableId ?? '')
            : [],
        },
      },
    },
  });

  const { data: targetCompanies } = useGetCompaniesQuery({
    variables: {
      where: {
        id: {
          in: activity?.activityTargets
            ? activity?.activityTargets
                .filter((target) => target.commentableType === 'Company')
                .map((target) => target.commentableId ?? '')
            : [],
        },
      },
    },
  });

  return (
    <RecoilScope SpecificContext={FieldContext}>
      <RecoilScope>
        <EditableField
          useEditButton
          customEditHotkeyScope={{
            scope: RelationPickerHotkeyScope.RelationPicker,
          }}
          iconLabel={<IconArrowUpRight />}
          editModeContent={
            <ActivityRelationEditableFieldEditMode activity={activity} />
          }
          label="Relations"
          displayModeContent={
            <StyledDisplayModeContainer>
              {targetCompanies?.companies &&
                targetCompanies.companies.map((company) => (
                  <CompanyChip
                    key={company.id}
                    id={company.id}
                    name={company.name}
                    pictureUrl={getLogoUrlFromDomainName(company.domainName)}
                  />
                ))}
              {targetPeople?.people &&
                targetPeople.people.map((person) => (
                  <PersonChip
                    key={person.id}
                    id={person.id}
                    name={person.displayName}
                    pictureUrl={person.avatarUrl ?? ''}
                  />
                ))}
            </StyledDisplayModeContainer>
          }
        />
      </RecoilScope>
    </RecoilScope>
  );
}
