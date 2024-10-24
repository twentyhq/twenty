import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { Button } from '@/ui/input/button/components/Button';
import { SettingsObjectFieldTable } from '~/pages/settings/data-model/SettingsObjectFieldTable';

import { Section } from '@/ui/layout/section/components/Section';
import styled from '@emotion/styled';
import { H2Title, IconPlus, UndecoratedLink } from 'twenty-ui';

const StyledContentContainer = styled.div`
  padding-left: ${({ theme }) => theme.spacing(8)};
`;

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
    <StyledContentContainer>
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
    </StyledContentContainer>
  );
};
