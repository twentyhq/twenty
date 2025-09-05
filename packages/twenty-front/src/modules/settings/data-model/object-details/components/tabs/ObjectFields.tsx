import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { SettingsPath } from '@/types/SettingsPath';
import { SettingsObjectFieldTable } from '~/pages/settings/data-model/SettingsObjectFieldTable';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { H2Title, IconPlus } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { UndecoratedLink } from 'twenty-ui/navigation';

const StyledDiv = styled.div`
  display: flex;
  justify-content: flex-end;
  padding-top: ${({ theme }) => theme.spacing(2)};
`;

type ObjectFieldsProps = {
  objectMetadataItem: ObjectMetadataItem;
};

export const ObjectFields = ({ objectMetadataItem }: ObjectFieldsProps) => {
  const shouldDisplayAddFieldButton = !objectMetadataItem.isRemote;

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
      {shouldDisplayAddFieldButton && (
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
