import { createElement, useRef, useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import { SegmentedControl } from 'twenty-ui/components/input';
import { Radio, RadioGroup } from 'twenty-ui/primitives/input';
import { DirectionProvider } from 'twenty-ui/primitives/layout';
import { Text } from 'twenty-ui/primitives/typography';

import { TwentyUiGalleryCard } from '@/__stories__/shared/front-components/twenty-ui-gallery-card';

const RadioGroupExample = () => {
  const [frequency, setFrequency] = useState('weekly');
  const [plan, setPlan] = useState('basic');
  const [frequencyChanges, setFrequencyChanges] = useState(0);
  const [frequencyCallback, setFrequencyCallback] = useState('pending');
  const [frequencyTargets, setFrequencyTargets] = useState('pending');
  const [planTargets, setPlanTargets] = useState('pending');
  const [view, setView] = useState('list');
  const [viewChanges, setViewChanges] = useState(0);
  const groupRef = useRef<HTMLDivElement>(null);
  const radioRef = useRef<HTMLSpanElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const indicatorRef = useRef<HTMLSpanElement>(null);
  const cardRef = useRef<HTMLSpanElement>(null);
  const cardInputRef = useRef<HTMLInputElement>(null);

  return (
    <TwentyUiGalleryCard title="Radio group">
      <form id="digest-preferences" aria-label="Digest preferences">
        <RadioGroup
          name="digest"
          ref={groupRef}
          aria-label="Digest frequency"
          data-native-owner="digest"
          render={<fieldset />}
          value={frequency}
          onValueChange={(nextFrequency, details) => {
            setFrequency(nextFrequency);
            setFrequencyChanges((count) => count + 1);
            setFrequencyCallback(`${details.reason}/${details.event.type}`);
            setFrequencyTargets(
              `${groupRef.current?.tagName}/${radioRef.current?.tagName}/${inputRef.current?.tagName}/${indicatorRef.current?.tagName}`,
            );
          }}
        >
          <Radio.Root
            ref={radioRef}
            inputRef={inputRef}
            value="daily"
            render={(props, state) =>
              createElement('span', {
                ...props,
                'data-selected': String(state.checked),
              })
            }
          >
            <Radio.Indicator
              ref={indicatorRef}
              keepMounted
              data-testid="daily-indicator"
              render={(props, state) =>
                createElement('span', {
                  ...props,
                  'data-selected': String(state.checked),
                })
              }
            />
            Daily
          </Radio.Root>
          <Radio value="weekly">Weekly</Radio>
          <Radio value="monthly" disabled>
            Monthly
          </Radio>
          <Radio value="quarterly">Quarterly</Radio>
        </RadioGroup>
      </form>
      <Text>Frequency: {frequency}</Text>
      <Text>
        Frequency changes: {frequencyChanges}; Callback: {frequencyCallback};
        Targets: {frequencyTargets}
      </Text>
      <RadioGroup
        aria-label="Plan"
        name="plan"
        form="digest-preferences"
        defaultValue="basic"
        onValueChange={(nextPlan) => {
          setPlan(nextPlan);
          setPlanTargets(
            `${cardRef.current?.tagName}/${cardInputRef.current?.tagName}`,
          );
        }}
      >
        <Radio variant="card" value="basic">
          Basic plan
        </Radio>
        <Radio
          ref={cardRef}
          inputRef={cardInputRef}
          variant="card"
          value="pro"
          nativeButton
          render={<button type="button" data-native-owner="plan" />}
        >
          Pro plan
        </Radio>
      </RadioGroup>
      <Text>
        Plan: {plan}; Targets: {planTargets}
      </Text>
      <DirectionProvider direction="rtl">
        <RadioGroup
          aria-label="Reading mode"
          defaultValue="summary"
          style={{ flexDirection: 'row' }}
        >
          <Radio value="summary">Summary</Radio>
          <Radio value="full">Full detail</Radio>
          <Radio value="audit">Detailed audit</Radio>
        </RadioGroup>
      </DirectionProvider>
      <form aria-label="Required preferences">
        <RadioGroup aria-label="Required preference" name="summaries" required>
          <Radio value="enabled">Enable summaries</Radio>
        </RadioGroup>
      </form>
      <SegmentedControl
        aria-label="Record view"
        value={view}
        onValueChange={(nextView) => {
          setView(nextView);
          setViewChanges((count) => count + 1);
        }}
        options={[
          { value: 'list', label: 'List view' },
          { value: 'board', label: 'Board view', disabled: true },
          { value: 'grid', label: 'Grid view' },
        ]}
      />
      <Text>
        View: {view}; Changes: {viewChanges}
      </Text>
    </TwentyUiGalleryCard>
  );
};

export default defineFrontComponent({
  universalIdentifier: '4d23e9af-7cb3-4e4a-bbca-8e960f840014',
  name: 'twenty-ui-radio-group',
  description:
    'Radio primitives, card composition and segmented choices in the sandbox',
  component: RadioGroupExample,
});
