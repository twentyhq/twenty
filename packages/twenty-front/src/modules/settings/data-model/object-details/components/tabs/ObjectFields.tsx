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

const StyledDiv = styled.div`
  display: flex;
  justify-content: flex-end;
  padding-top: ${({ theme }) => theme.spacing(2)};
`;

type ObjectFieldsProps = {
  objectMetadataItem: ObjectMetadataItem;
};

export const ObjectFields = ({ objectMetadataItem }: ObjectFieldsProps) => {
  const readonly = isObjectMetadataSettingsReadOnly({
    objectMetadataItem,
  });

  const { t } = useLingui();
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
