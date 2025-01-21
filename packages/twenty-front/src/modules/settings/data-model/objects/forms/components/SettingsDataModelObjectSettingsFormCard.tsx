import styled from '@emotion/styled';
import { useMemo } from 'react';
import { useFormContext } from 'react-hook-form';

import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { getLabelIdentifierFieldMetadataItem } from '@/object-metadata/utils/getLabelIdentifierFieldMetadataItem';
import { SettingsDataModelCardTitle } from '@/settings/data-model/components/SettingsDataModelCardTitle';
import { SettingsDataModelFieldPreviewCard } from '@/settings/data-model/fields/preview/components/SettingsDataModelFieldPreviewCard';
import { SettingsDataModelObjectSummary } from '@/settings/data-model/objects/components/SettingsDataModelObjectSummary';
import {
  SettingsDataModelObjectIdentifiersForm,
  SettingsDataModelObjectIdentifiersFormValues,
} from '@/settings/data-model/objects/forms/components/SettingsDataModelObjectIdentifiersForm';
import { Trans } from '@lingui/react/macro';
import { Card, CardContent, isDefined } from 'twenty-ui';

type SettingsDataModelObjectSettingsFormCardProps = {
  objectMetadataItem: ObjectMetadataItem;
  onBlur: () => void
};

const StyledFieldPreviewCard = styled(SettingsDataModelFieldPreviewCard)`
  width: 100%;
`;

const StyledTopCardContent = styled(CardContent)`
  background-color: ${({ theme }) => theme.background.transparent.lighter};
`;

const StyledObjectSummaryCard = styled(Card)`
  border-radius: ${({ theme }) => theme.border.radius.md};
  color: ${({ theme }) => theme.font.color.primary};
  max-width: 480px;
`;

const StyledObjectSummaryCardContent = styled(CardContent)`
  padding: ${({ theme }) => theme.spacing(2)};
`;

export const SettingsDataModelObjectSettingsFormCard = ({
  objectMetadataItem,
  onBlur
}: SettingsDataModelObjectSettingsFormCardProps) => {
  const { watch: watchFormValue } =
    useFormContext<SettingsDataModelObjectIdentifiersFormValues>();

  const labelIdentifierFieldMetadataIdFormValue = watchFormValue(
    'labelIdentifierFieldMetadataId',
  );

  const labelIdentifierFieldMetadataItem = useMemo(
    () =>
      getLabelIdentifierFieldMetadataItem({
        fields: objectMetadataItem.fields,
        labelIdentifierFieldMetadataId: labelIdentifierFieldMetadataIdFormValue,
      }),
    [labelIdentifierFieldMetadataIdFormValue, objectMetadataItem],
  );
  
  return (
    <Card fullWidth>
      <StyledTopCardContent divider>
        <SettingsDataModelCardTitle>
          <Trans>Preview</Trans>
        </SettingsDataModelCardTitle>
        {JSON.stringify(labelIdentifierFieldMetadataItem)}
        {labelIdentifierFieldMetadataItem ? (
          <StyledFieldPreviewCard
            objectMetadataItem={objectMetadataItem}
            fieldMetadataItem={labelIdentifierFieldMetadataItem}
            withFieldLabel={false}
          />
        ) : (
          <StyledObjectSummaryCard>
            <StyledObjectSummaryCardContent>
              <SettingsDataModelObjectSummary
                objectMetadataItem={objectMetadataItem}
              />
            </StyledObjectSummaryCardContent>
          </StyledObjectSummaryCard>
        )}
      </StyledTopCardContent>
      <CardContent>
        <SettingsDataModelObjectIdentifiersForm
          objectMetadataItem={objectMetadataItem}
          onBlur={onBlur}
          defaultLabelIdentifierFieldMetadataId={
            (() => {
              // TMP is any here as the ternary might return any it overrides the null
              // Why is it any ? what if it was unknonw ?
              const tmp = isDefined(labelIdentifierFieldMetadataItem) ? labelIdentifierFieldMetadataItem.id : null
              return tmp
            })()
          }
        />
      </CardContent>
    </Card>
  );
};
