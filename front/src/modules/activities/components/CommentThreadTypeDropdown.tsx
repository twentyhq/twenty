import {
  Chip,
  ChipAccent,
  ChipSize,
  ChipVariant,
} from '@/ui/chip/components/Chip';
import { IconPhone } from '@/ui/icon';
import { CommentThread } from '~/generated/graphql';

type OwnProps = {
  commentThread: Pick<CommentThread, 'type'>;
};

export function CommentThreadTypeDropdown({ commentThread }: OwnProps) {
  return (
    <Chip
      label={commentThread.type}
      leftComponent={<IconPhone size={16} />}
      size={ChipSize.Large}
      accent={ChipAccent.TextSecondary}
      variant={ChipVariant.Highlighted}
    />
  );
}
