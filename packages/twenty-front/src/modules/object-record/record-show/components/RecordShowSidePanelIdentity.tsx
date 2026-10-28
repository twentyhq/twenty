import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { RecordIdentifierBarCreatedAt } from '@/object-record/record-show/components/RecordIdentifierBarCreatedAt';
import { RecordShowSidePanelQuickActions } from '@/object-record/record-show/components/RecordShowSidePanelQuickActions';
import { useRecordIdentifierTitle } from '@/object-record/record-show/hooks/useRecordIdentifierTitle';
import { RecordTitleCell } from '@/object-record/record-title-cell/components/RecordTitleCell';
import { RecordTitleCellContainerType } from '@/object-record/record-title-cell/types/RecordTitleCellContainerType';
import { getAvatarButtonRender } from '@/ui/field/display/utils/getAvatarButtonRender';
import { styled } from '@linaria/react';
import { useRef, type ChangeEvent } from 'react';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Avatar } from 'twenty-ui/primitives/data-display';
import { themeCssVariables } from 'twenty-ui/theme';
import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';

const StyledContainer = styled.div`
  background: ${themeCssVariables.background.primary};
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  gap: ${themeCssVariables.spacing[5]};
  padding: ${themeCssVariables.spacing[6]} ${themeCssVariables.spacing[4]}
    ${themeCssVariables.spacing[4]};
`;

const StyledIdentityRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[4]};
`;

const StyledAvatarTile = styled.div`
  align-items: center;
  background: ${themeCssVariables.background.secondary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.xl};
  box-sizing: border-box;
  display: flex;
  flex-shrink: 0;
  height: 52px;
  justify-content: center;
  width: 52px;
`;

const StyledTextContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
  min-width: 0;
`;

// Flex keeps the centered title cell at content width; the margin offsets its hover padding.
const StyledTitle = styled.div`
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  font-size: ${themeCssVariables.font.size.xl};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  margin-left: -5px;
  min-width: 0;
`;

const OBJECTS_WITHOUT_QUICK_ACTIONS: string[] = [
  CoreObjectNameSingular.Note,
  CoreObjectNameSingular.Task,
];

const StyledFileInput = styled.input`
  display: none;
`;

type RecordShowSidePanelIdentityProps = {
  objectNameSingular: string;
  objectRecordId: string;
};

export const RecordShowSidePanelIdentity = ({
  objectNameSingular,
  objectRecordId,
}: RecordShowSidePanelIdentityProps) => {
  const { recordIdentifier, onUploadPicture, titleFieldContextValue } =
    useRecordIdentifierTitle({
      objectNameSingular,
      objectRecordId,
    });

  const inputFileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (isDefined(event.target.files)) {
      onUploadPicture?.(event.target.files[0]);
    }
  };

  const avatarName = recordIdentifier?.name ?? '';

  return (
    <StyledContainer>
      <StyledIdentityRow>
        <StyledAvatarTile>
          <Avatar
            src={getAbsoluteImageUrl(recordIdentifier?.avatarUrl ?? '')}
            render={getAvatarButtonRender({
              name: avatarName,
              onClick: isDefined(onUploadPicture)
                ? () => inputFileRef.current?.click()
                : undefined,
            })}
            name={avatarName}
            colorSeed={objectRecordId}
            shape={recordIdentifier?.avatarShape ?? 'circle'}
            size="xl"
          />
        </StyledAvatarTile>
        <StyledTextContainer>
          <StyledTitle>
            <FieldContext.Provider value={titleFieldContextValue}>
              <RecordTitleCell
                sizeVariant="md"
                containerType={RecordTitleCellContainerType.PageHeader}
              />
            </FieldContext.Provider>
          </StyledTitle>
          <RecordIdentifierBarCreatedAt objectRecordId={objectRecordId} />
        </StyledTextContainer>
      </StyledIdentityRow>
      {!OBJECTS_WITHOUT_QUICK_ACTIONS.includes(objectNameSingular) && (
        <RecordShowSidePanelQuickActions
          objectNameSingular={objectNameSingular}
          objectRecordId={objectRecordId}
        />
      )}
      <StyledFileInput
        ref={inputFileRef}
        onChange={handleFileChange}
        type="file"
      />
    </StyledContainer>
  );
};
