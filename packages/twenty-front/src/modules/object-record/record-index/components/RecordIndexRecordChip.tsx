import { useGetStandardObjectIcon } from '@/object-metadata/hooks/useGetStandardObjectIcon';
import { useRecordChipData } from '@/object-record/hooks/useRecordChipData';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { isNonEmptyString } from '@sniptt/guards';
import {
  AvatarChip,
  AvatarChipVariant,
  ChipSize,
  LinkAvatarChip,
} from 'twenty-ui';

type RecordIdentifierChipCommonsProps = {
  objectNameSingular: string;
  record: ObjectRecord;
  variant?: AvatarChipVariant;
  size?: ChipSize;
  maxWidth?: number;
};

type RecordIdentifierChipLinkProps = { to: string };
type RecordIdentifierChipRegularProps = { onClick: () => void };
type RecordIdentifierChipProps = RecordIdentifierChipCommonsProps &
  (RecordIdentifierChipRegularProps | RecordIdentifierChipLinkProps);

const isLinkChip = (
  props: RecordIdentifierChipRegularProps | RecordIdentifierChipLinkProps,
): props is RecordIdentifierChipLinkProps => Object.hasOwn(props, 'to');

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

  const { Icon: LeftIcon, IconColor: LeftIconColor } =
    useGetStandardObjectIcon(objectNameSingular);

  if (!isNonEmptyString(recordChipData.name.trim())) {
    return null;
  }

  if (isLinkChip(props)) {
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
      />
    );
  }

  return (
    <AvatarChip
      placeholderColorSeed={record.id}
      name={recordChipData.name}
      avatarType={recordChipData.avatarType}
      avatarUrl={recordChipData.avatarUrl ?? ''}
      onClick={props.onClick}
      variant={variant}
      LeftIcon={LeftIcon}
      LeftIconColor={LeftIconColor}
      size={size}
      maxWidth={maxWidth}
    />
  );
};
