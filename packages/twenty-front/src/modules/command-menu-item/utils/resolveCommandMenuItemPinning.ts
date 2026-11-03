import { type ConditionalDisplayEvaluationContext } from '@/conditional-display/types/ConditionalDisplayEvaluationContext';
import { evaluateConditionalDisplayWithObjectMetadata } from '@/conditional-display/utils/evaluateConditionalDisplayWithObjectMetadata';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type CommandMenuItemFieldsFragment } from '~/generated-metadata/graphql';

type PinnableCommandMenuItem = Pick<
  CommandMenuItemFieldsFragment,
  'isPinned' | 'conditionalPinned'
>;

// Resolved once where availability is evaluated, so every consumer keeps
// reading isPinned as a plain boolean.
export const resolveCommandMenuItemPinning = <
  TCommandMenuItem extends PinnableCommandMenuItem,
>({
  commandMenuItem,
  conditionalDisplayContext,
  objectMetadataItem,
  objectMetadataItems,
}: {
  commandMenuItem: TCommandMenuItem;
  conditionalDisplayContext: ConditionalDisplayEvaluationContext;
  objectMetadataItem?: EnrichedObjectMetadataItem;
  objectMetadataItems: EnrichedObjectMetadataItem[];
}): TCommandMenuItem => ({
  ...commandMenuItem,
  isPinned:
    commandMenuItem.isPinned &&
    evaluateConditionalDisplayWithObjectMetadata({
      conditionalDisplay: commandMenuItem.conditionalPinned,
      context: conditionalDisplayContext,
      records: conditionalDisplayContext.selectedRecords ?? [],
      objectMetadataItem,
      objectMetadataItems,
    }),
});
