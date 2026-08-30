import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { useRecordIdentifierTitle } from '@/object-record/record-show/hooks/useRecordIdentifierTitle';
import { RecordTitleCell } from '@/object-record/record-title-cell/components/RecordTitleCell';
import { RecordTitleCellContainerType } from '@/object-record/record-title-cell/types/RecordTitleCellContainerType';
import { HeaderIdentifier } from '@/ui/layout/page/components/HeaderIdentifier';
import { styled } from '@linaria/react';
import { useRef, type ChangeEvent } from 'react';
import { AppPath } from 'twenty-shared/types';
import { getAppPath, isDefined } from 'twenty-shared/utils';
import { UndecoratedLink } from 'twenty-ui/navigation';
import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';

const StyledFileInput = styled.input`
  display: none;
`;

type RecordIdentifierBarTitleProps = {
  objectNameSingular: string;
  objectRecordId: string;
  variant?: 'record-page' | 'side-panel';
};

export const RecordIdentifierBarTitle = ({
  objectNameSingular,
  objectRecordId,
  variant = 'record-page',
}: RecordIdentifierBarTitleProps) => {
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

  const isAvatarEditable = isDefined(onUploadPicture);
  const isInSidePanel = variant === 'side-panel';

  const title = (
    <FieldContext.Provider value={titleFieldContextValue}>
      <RecordTitleCell
        sizeVariant="sm"
        containerType={
          isInSidePanel
            ? RecordTitleCellContainerType.PageHeader
            : RecordTitleCellContainerType.ShowPage
        }
      />
    </FieldContext.Provider>
  );

  return (
    <>
      <HeaderIdentifier
        fontSize={isInSidePanel ? 'md' : 'lg'}
        avatar={{
          avatarUrl: getAbsoluteImageUrl(recordIdentifier?.avatarUrl ?? ''),
          onClick: isAvatarEditable
            ? () => inputFileRef.current?.click?.()
            : undefined,
          placeholderColorSeed: objectRecordId,
          placeholder: recordIdentifier?.name ?? '',
          type: recordIdentifier?.avatarType ?? 'rounded',
        }}
        title={
          // A writable title has to stay click-to-edit, so only a read-only one
          // can double as a link to the record page.
          isInSidePanel && titleFieldContextValue.isRecordFieldReadOnly ? (
            <UndecoratedLink
              to={getAppPath(AppPath.RecordShowPage, {
                objectNameSingular,
                objectRecordId,
              })}
            >
              {title}
            </UndecoratedLink>
          ) : (
            title
          )
        }
      />
      <StyledFileInput
        ref={inputFileRef}
        onChange={handleFileChange}
        type="file"
      />
    </>
  );
};
