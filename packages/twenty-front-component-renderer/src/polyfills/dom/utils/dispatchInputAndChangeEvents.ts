import { type InputClickActivationContext } from '@/polyfills/dom/types/InputClickActivationContext';
import { resolveOwnerWindowOfNode } from '@/polyfills/dom/utils/resolveOwnerWindowOfNode';
import { applySyntheticEventCompatibility } from '@/polyfills/events/utils/applySyntheticEventCompatibility';
import { resolveBaseEventClass } from '@/polyfills/events/utils/resolveBaseEventClass';

const INPUT_ACTIVATION_EVENT_TYPES = ['input', 'change'] as const;

type DispatchInputAndChangeEventsInput = Pick<
  InputClickActivationContext,
  'inputElement' | 'dispatchEvent'
>;

export const dispatchInputAndChangeEvents = ({
  inputElement,
  dispatchEvent,
}: DispatchInputAndChangeEventsInput): void => {
  const baseEventClass = resolveBaseEventClass(
    resolveOwnerWindowOfNode(inputElement),
  );

  for (const eventType of INPUT_ACTIVATION_EVENT_TYPES) {
    dispatchEvent(
      applySyntheticEventCompatibility(
        new baseEventClass(eventType, { bubbles: true }),
      ),
    );
  }
};
