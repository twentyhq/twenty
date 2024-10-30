import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { SettingsObjectFieldTable } from '~/pages/settings/data-model/SettingsObjectFieldTable';

import styled from '@emotion/styled';
import { Button, H2Title, IconPlus, Section, UndecoratedLink } from 'twenty-ui';

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

  return (
    <Section>
      <H2Title
        title="Fields"
        description={`Customise the fields available in the ${objectMetadataItem.labelSingular} views and their display order in the ${objectMetadataItem.labelSingular} detail view and menus.`}
      />
      <SettingsObjectFieldTable
        objectMetadataItem={objectMetadataItem}
        mode="view"
      />
      {shouldDisplayAddFieldButton && (
        <StyledDiv>
          <UndecoratedLink to={'./new-field/select'}>
            <Button
              Icon={IconPlus}
              title="Add Field"
              size="small"
              variant="secondary"
            />
          </UndecoratedLink>
        </StyledDiv>
      )}
    </Section>
  );
};
