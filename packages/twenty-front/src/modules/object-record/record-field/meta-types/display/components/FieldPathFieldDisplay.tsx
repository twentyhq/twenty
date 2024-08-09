import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { isSelectableFieldPathPart } from '@/object-record/field-path-picker/utils/isSelectableFieldPathPart';
import { useFieldPathFieldDisplay } from '@/object-record/record-field/meta-types/hooks/useFieldPathFieldDisplay';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { createPortal } from 'react-dom';
import { AppTooltip, IconCaretRightFilled, Tag, TooltipDelay } from 'twenty-ui';

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
`;

const StyledIconCaretRightFilled = styled(IconCaretRightFilled)`
  color: ${({ theme }) => theme.color.gray40};
`;

export const FieldPathFieldDisplay = () => {
  const theme = useTheme();

  const { fieldValue, fieldDefinition } = useFieldPathFieldDisplay();

  const containerId = `field-path-display-${fieldDefinition.fieldMetadataId}`;

  const { objectMetadataItems } = useFilteredObjectMetadataItems();

  const allFieldMetadataItems = objectMetadataItems
    .flatMap((objectMetadata) => objectMetadata.fields)
    .filter(isSelectableFieldPathPart);

  const fieldLabelById = new Map(
    allFieldMetadataItems.map((fieldMetadata) => [
      fieldMetadata.id,
      fieldMetadata.label,
    ]),
  );

  const fieldLabels =
    fieldValue?.map((fieldMetadataId) => fieldLabelById.get(fieldMetadataId)) ??
    [];

  if (fieldLabels.some((fieldName) => fieldName === undefined)) {
    return <div>Invalid field path</div>; // TODO: Tooltip - a field in the path has been deactivated
  }

  const tooltipContent = fieldLabels
    .flatMap((fieldLabel, i) => {
      const isLast = i === fieldLabels.length - 1;
      return [fieldLabel, isLast ? '' : ' \u25B8 '];
    })
    .join('');

  // TODO: Tooltip - display full field path
  return (
    <>
      <StyledContainer id={containerId}>
        {fieldLabels.map((fieldName, i) => {
          const isLast = i === fieldLabels.length - 1;
          return [
            <Tag preventShrink color="gray" text={fieldName as string} />,
            isLast ? null : (
              <StyledIconCaretRightFilled size={theme.icon.size.sm} />
            ),
          ];
        })}
      </StyledContainer>
      {createPortal(
        <AppTooltip
          anchorSelect={`#${containerId}`}
          content={tooltipContent}
          offset={5}
          noArrow
          place="bottom"
          positionStrategy="absolute"
          delay={TooltipDelay.mediumDelay}
        ></AppTooltip>,
        document.body,
      )}
    </>
  );
};
