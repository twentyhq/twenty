import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { SettingsObjectFieldTable } from '~/pages/settings/data-model/SettingsObjectFieldTable';

import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { H2Title, IconPlus } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { UndecoratedLink } from 'twenty-ui/navigation';
import { isObjectMetadataSettingsReadOnly } from '@/object-record/read-only/utils/isObjectMetadataSettingsReadOnly';
import { useRecoilValue } from 'recoil';
import { SettingsDetailFieldOrderSection } from '@/settings/data-model/object-details/components/SettingsDetailFieldOrderSection';

const StyledDiv = styled.div`
  display: flex;
  justify-content: flex-end;
  padding-top: ${({ theme }) => theme.spacing(2)};
`;

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(8)};
`;

type ObjectFieldsProps = {
  objectMetadataItem: ObjectMetadataItem;
};

export const ObjectFields = ({ objectMetadataItem }: ObjectFieldsProps) => {
  const currentWorkspace = useRecoilValue(currentWorkspaceState);
  const readonly = isObjectMetadataSettingsReadOnly({
    objectMetadataItem,
    workspaceCustomApplicationId:
      currentWorkspace?.workspaceCustomApplication?.id,
  });

  const { t } = useLingui();
  const objectLabelSingular = objectMetadataItem.labelSingular;

  return (
    <StyledContainer>
      <Section>
        <H2Title
          title={t`Fields`}
          description={t`Customise the fields available in the ${objectLabelSingular} views.`}
        />
        <SettingsObjectFieldTable
          objectMetadataItem={objectMetadataItem}
          mode="view"
        />
        {!readonly && (
          <StyledDiv>
            <UndecoratedLink
              to={getSettingsPath(SettingsPath.ObjectNewFieldSelect, {
                objectNamePlural: objectMetadataItem.namePlural,
              })}
            >
              <Button
                Icon={IconPlus}
                title={t`Add Field`}
                size="small"
                variant="secondary"
              />
            </UndecoratedLink>
          </StyledDiv>
        )}
      </Section>
      <SettingsDetailFieldOrderSection objectMetadataItem={objectMetadataItem} />
    </StyledContainer>
  );
};
