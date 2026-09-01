import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { useRecordIdentifierTitle } from '@/object-record/record-show/hooks/useRecordIdentifierTitle';
import { RecordTitleCell } from '@/object-record/record-title-cell/components/RecordTitleCell';
import { RecordTitleCellContainerType } from '@/object-record/record-title-cell/types/RecordTitleCellContainerType';
import { HeaderIdentifier } from '@/ui/layout/page/components/HeaderIdentifier';
import { styled } from '@linaria/react';
import { useRef, type ChangeEvent, type MouseEvent } from 'react';
import { AppPath } from 'twenty-shared/types';
import { getAppPath, isDefined } from 'twenty-shared/utils';
import { UndecoratedLink } from 'twenty-ui/navigation';
import { useNavigateApp } from '~/hooks/useNavigateApp';
import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';

const StyledFileInput = styled.input`
  display: none;
`;

type RecordIdentifierBarTitleProps = {
  objectNameSingular: string;
  objectRecordId: string;
  variant?: 'record-page' | 'side-panel';
  recordLinkSurface?: 'main';
};

export const RecordIdentifierBarTitle = ({
  objectNameSingular,
  objectRecordId,
  variant = 'record-page',
  recordLinkSurface,
}: RecordIdentifierBarTitleProps) => {
  const { recordIdentifier, onUploadPicture, titleFieldContextValue } =
    useRecordIdentifierTitle({
      objectNameSingular,
      objectRecordId,
    });

  const inputFileRef = useRef<HTMLInputElement>(null);
  const navigateApp = useNavigateApp();

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (isDefined(event.target.files)) {
      onUploadPicture?.(event.target.files[0]);
    }
  };

  const isAvatarEditable = isDefined(onUploadPicture);
  const isInSidePanel = variant === 'side-panel';

  const handleRecordLinkClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (
      recordLinkSurface !== 'main' ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    event.preventDefault();
    navigateApp(
      AppPath.RecordShowPage,
      { objectNameSingular, objectRecordId },
      undefined,
      { surface: 'main' },
    );
  };

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
              onClick={handleRecordLinkClick}
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
