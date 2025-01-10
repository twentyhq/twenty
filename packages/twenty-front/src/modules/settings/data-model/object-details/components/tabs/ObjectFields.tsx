import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { SettingsObjectFieldTable } from '~/pages/settings/data-model/SettingsObjectFieldTable';

import styled from '@emotion/styled';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();

  return (
    <Section>
      <H2Title
        title={t('fields')}
        description={t('fieldsDescription', { objectMetadata: objectMetadataItem.labelSingular})}
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
              title={t('addField')}
              size="small"
              variant="secondary"
            />
          </UndecoratedLink>
        </StyledDiv>
      )}
    </Section>
  );
};
