import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { isObjectMetadataReadOnly } from '@/object-record/read-only/utils/isObjectMetadataReadOnly';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { useRecoilValue } from 'recoil';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { H2Title, IconPlus } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { UndecoratedLink } from 'twenty-ui/navigation';
import { SettingsObjectFieldTable } from '~/pages/settings/data-model/SettingsObjectFieldTable';

const StyledDiv = styled.div`
  display: flex;
  justify-content: flex-end;
  padding-top: ${({ theme }) => theme.spacing(2)};
`;

type ObjectFieldsProps = {
  objectMetadataItem: ObjectMetadataItem;
};

export const ObjectFields = ({ objectMetadataItem }: ObjectFieldsProps) => {
  const currentWorkspace = useRecoilValue(currentWorkspaceState);
  const { t } = useLingui();
  const readonly = isObjectMetadataReadOnly({
    objectMetadataItem,
  });

  const objectLabelSingular = objectMetadataItem.labelSingular;

  return (
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
  );
};
