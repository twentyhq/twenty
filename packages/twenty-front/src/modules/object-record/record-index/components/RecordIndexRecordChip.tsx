import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { useGetStandardObjectIcon } from '@/object-metadata/hooks/useGetStandardObjectIcon';
import { useRecordChipData } from '@/object-record/hooks/useRecordChipData';
import { recordIndexOpenRecordInSelector } from '@/object-record/record-index/states/selectors/recordIndexOpenRecordInSelector';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { ViewOpenRecordInType } from '@/views/types/ViewOpenRecordInType';
import { isNonEmptyString } from '@sniptt/guards';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared';
import {
  AvatarChip,
  AvatarChipVariant,
  ChipSize,
  LinkAvatarChip,
} from 'twenty-ui';

type RecordIdentifierChipLinkProps = {
  to: string;
  onClick?: () => void;
};
type RecordIdentifierChipProps = {
  objectNameSingular: string;
  record: ObjectRecord;
  variant?: AvatarChipVariant;
  size?: ChipSize;
  maxWidth?: number;
} & (RecordIdentifierChipLinkProps | { to: undefined });

const isRecordIdentifierLinkChip = (
  props: RecordIdentifierChipLinkProps | { to: undefined },
): props is RecordIdentifierChipLinkProps =>
  Object.hasOwn(props, 'to') && isDefined(props['to']);

// TODO not the same as file ?
export const RecordIdentifierChip = ({
  objectNameSingular,
  record,
  variant,
  size,
  maxWidth,
  ...props
}: RecordIdentifierChipProps) => {
  const { recordChipData } = useRecordChipData({
    objectNameSingular,
    record,
  });
  const recordIndexOpenRecordIn = useRecoilValue(
    recordIndexOpenRecordInSelector,
  );
  const { openRecordInCommandMenu } = useCommandMenu();
  const { Icon: LeftIcon, IconColor: LeftIconColor } =
    useGetStandardObjectIcon(objectNameSingular);

  if (!isNonEmptyString(recordChipData.name.trim())) {
    return null;
  }

  if (!isRecordIdentifierLinkChip(props)) {
    return (
      <AvatarChip
        placeholderColorSeed={record.id}
        name={recordChipData.name}
        avatarType={recordChipData.avatarType}
        avatarUrl={recordChipData.avatarUrl ?? ''}
        variant={variant}
        LeftIcon={LeftIcon}
        LeftIconColor={LeftIconColor}
        size={size}
        maxWidth={maxWidth}
      />
    );
  }

  const onClick =
    recordIndexOpenRecordIn === ViewOpenRecordInType.SIDE_PANEL
      ? () =>
          openRecordInCommandMenu({
            recordId: record.id,
            objectNameSingular,
          })
      : undefined;

  return (
    <LinkAvatarChip
      placeholderColorSeed={record.id}
      name={recordChipData.name}
      avatarType={recordChipData.avatarType}
      avatarUrl={recordChipData.avatarUrl ?? ''}
      to={props.to}
      variant={variant}
      LeftIcon={LeftIcon}
      LeftIconColor={LeftIconColor}
      size={size}
      maxWidth={maxWidth}
      onClick={onClick}
    />
  );
};
