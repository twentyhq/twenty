import { styled } from '@linaria/react';
import { useContext } from 'react';

import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { fieldMetadataItemByIdSelector } from '@/object-metadata/states/fieldMetadataItemByIdSelector';
import { isFieldMetadataItemLabelIdentifierSelector } from '@/object-metadata/states/isFieldMetadataItemLabelIdentifierSelector';
import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { shouldCompactRecordTableFirstColumnComponentState } from '@/object-record/record-table/states/shouldCompactRecordTableFirstColumnComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useIcons } from 'twenty-ui/display';
import {
  MOBILE_VIEWPORT,
  ThemeContext,
  themeCssVariables,
} from 'twenty-ui/theme-constants';

const StyledTitle = styled.div<{ hideTitle?: boolean }>`
  align-items: center;
  display: flex;
  flex-direction: row;
  font-weight: ${themeCssVariables.font.weight.medium};
  gap: ${themeCssVariables.spacing[1]};
  height: ${themeCssVariables.spacing[8]};
  padding-left: ${themeCssVariables.spacing[2]};
  padding-right: ${themeCssVariables.spacing[2]};

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    display: ${({ hideTitle }) => (hideTitle ? 'none' : 'flex')};
  }
`;

const StyledIcon = styled.div`
  display: flex;
  flex-shrink: 0;

  & > svg {
    height: ${themeCssVariables.icon.size.md}px;
    width: ${themeCssVariables.icon.size.md}px;
  }
`;

const StyledText = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

type RecordTableColumnHeadProps = {
  recordField: RecordField;
};

export const RecordTableColumnHead = ({
  recordField,
}: RecordTableColumnHeadProps) => {
  const { theme } = useContext(ThemeContext);

  const correspondingFieldMetadataItem = useAtomFamilySelectorValue(
    fieldMetadataItemByIdSelector,
    { fieldMetadataItemId: recordField.fieldMetadataItemId },
  );

  const { getIcon } = useIcons();
  const { objectMetadataItems } = useObjectMetadataItems();

  // OMNIA-CUSTOM: For sub-field columns, resolve the label from the target object
  let headerLabel =
    correspondingFieldMetadataItem.foundFieldMetadataItem?.label ?? '';
  let headerIcon =
    correspondingFieldMetadataItem.foundFieldMetadataItem?.icon;

  if (recordField.subFieldName && correspondingFieldMetadataItem.foundFieldMetadataItem) {
    const targetObjName = correspondingFieldMetadataItem.foundFieldMetadataItem
      .relation?.targetObjectMetadata?.nameSingular;
    const targetObj = objectMetadataItems.find(
      (o) => o.nameSingular === targetObjName,
    );
    const subField = targetObj?.fields.find(
      (f) => f.name === recordField.subFieldName && f.isActive,
    );
    if (subField) {
      headerLabel = `${headerLabel} / ${subField.label}`;
      headerIcon = subField.icon ?? headerIcon;
    }
  }

  const Icon = getIcon(headerIcon);

  const isLabelIdentifier = useAtomFamilySelectorValue(
    isFieldMetadataItemLabelIdentifierSelector,
    { fieldMetadataItemId: recordField.fieldMetadataItemId },
  );

  const shouldCompactRecordTableFirstColumn = useAtomComponentStateValue(
    shouldCompactRecordTableFirstColumnComponentState,
  );

  const shouldHideTitle =
    shouldCompactRecordTableFirstColumn && isLabelIdentifier;

  return (
    <StyledTitle hideTitle={shouldHideTitle}>
      <StyledIcon>
        <Icon size={theme.icon.size.md} />
      </StyledIcon>
      <StyledText>
        {headerLabel}
      </StyledText>
    </StyledTitle>
  );
};
