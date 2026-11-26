import { getRelatedRecordsWithLookupValue } from '@/object-record/record-column-scope/utils/getRelatedRecordsWithLookupValue';
import { FieldDisplay } from '@/object-record/record-field/ui/components/FieldDisplay';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { useFieldFocus } from '@/object-record/record-field/ui/hooks/useFieldFocus';
import { RelationWithUnloadedRecordCount } from '@/object-record/record-field/ui/meta-types/display/components/RelationWithUnloadedRecordCount';
import { MAX_RELATION_CHIPS_DISPLAYED_INLINE } from '@/object-record/record-field/ui/meta-types/display/constants/MaxRelationChipsDisplayedInline';
import { useRelationFromManyFieldDisplay } from '@/object-record/record-field/ui/meta-types/hooks/useRelationFromManyFieldDisplay';
import { type FieldDefinition } from '@/object-record/record-field/ui/types/FieldDefinition';
import { type FieldMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isArray } from '@sniptt/guards';
import { OverflowingList } from 'twenty-ui/components/layout';
import { Separator } from 'twenty-ui/primitives/layout';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledSeparatorContainer = styled.div`
  display: flex;
  padding: ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[1]}
    ${themeCssVariables.spacing[1]} 0;
`;

type ScopedRelationLookupFieldDisplayProps = {
  lookupTargetFieldDefinition: FieldDefinition<FieldMetadata>;
};

export const ScopedRelationLookupFieldDisplay = ({
  lookupTargetFieldDefinition,
}: ScopedRelationLookupFieldDisplayProps) => {
  const { t } = useLingui();
  const { fieldValue, totalCount } = useRelationFromManyFieldDisplay();
  const { isFocused } = useFieldFocus();

  if (!isArray(fieldValue)) {
    return null;
  }

  return (
    <RelationWithUnloadedRecordCount
      unloadedRecordCount={(totalCount ?? 0) - fieldValue.length}
    >
      <OverflowingList
        overflowLabel={t`Show all items`}
        showOverflowCount={isFocused}
        maxInlineCount={MAX_RELATION_CHIPS_DISPLAYED_INLINE}
      >
        {getRelatedRecordsWithLookupValue({
          relatedRecords: fieldValue,
          lookupTargetFieldDefinition,
        }).map((relatedRecord, index) => (
          <FieldContext.Provider
            key={relatedRecord.id}
            value={{
              recordId: relatedRecord.id,
              fieldDefinition: lookupTargetFieldDefinition,
              isLabelIdentifier: false,
              isRecordFieldReadOnly: true,
              displayedMaxRows: 1,
            }}
          >
            {index > 0 && (
              <StyledSeparatorContainer>
                <Separator orientation="vertical" />
              </StyledSeparatorContainer>
            )}
            <FieldDisplay />
          </FieldContext.Provider>
        ))}
      </OverflowingList>
    </RelationWithUnloadedRecordCount>
  );
};
