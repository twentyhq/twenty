import { EntityForSelect } from '@/ui/relation-picker/types/EntityForSelect';
import { CommentableType } from '~/generated/graphql';

export type CommentableEntityForSelect = EntityForSelect & {
  entityType: CommentableType;
};
