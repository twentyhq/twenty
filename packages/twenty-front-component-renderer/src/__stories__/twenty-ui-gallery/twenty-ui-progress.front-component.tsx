import { createElement, useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import { isDefined } from 'twenty-shared/utils';
import { MetricRow } from 'twenty-ui/components/data-display';
import { IconDatabase } from 'twenty-ui/icon';
import {
  Progress,
  ProgressBar,
  ProgressRing,
} from 'twenty-ui/primitives/feedback';
import { Button } from 'twenty-ui/primitives/input';
import { Text } from 'twenty-ui/primitives/typography';

import { TwentyUiGalleryCard } from '@/__stories__/shared/front-components/twenty-ui-gallery-card';

const ProgressExample = () => {
  const [progress, setProgress] = useState<number | null>(25);
  const [range, setRange] = useState({ min: 10, max: 70 });
  const [pointerEntries, setPointerEntries] = useState(0);

  const recordProgressRef = (element: HTMLElement | null) => {
    if (isDefined(element)) {
      element.dataset.refTag = element.tagName;
    }
  };

  return (
    <TwentyUiGalleryCard title="Progress parts, ranges and native roots">
      <ProgressBar
        min={range.min}
        max={range.max}
        value={progress}
        aria-label="Import bar"
        id="import-bar"
        title="Import bar title"
        lang="fr"
        className="custom-progress-bar"
        style={{ marginTop: 7, width: 200 }}
        render={<section data-composed="bar" />}
        ref={recordProgressRef}
        onMouseEnter={() => setPointerEntries((entries) => entries + 1)}
      />
      <ProgressRing
        min={range.min}
        max={range.max}
        value={progress}
        aria-label="Import ring"
        id="import-ring"
        title="Import ring title"
        lang="fr"
        className="custom-progress-ring"
        style={{ marginTop: 9 }}
        render={(props, state) =>
          createElement('article', {
            ...props,
            'data-composed': 'ring',
            'data-render-status': state.status,
          })
        }
        ref={recordProgressRef}
      >
        {isDefined(progress) ? `${progress} records` : 'Waiting for records'}
      </ProgressRing>
      <Progress.Root
        min={range.min}
        max={range.max}
        value={progress}
        render={<section data-composed="parts" />}
        ref={recordProgressRef}
      >
        <Progress.Label
          id="progress-records-label"
          render={<strong />}
          ref={recordProgressRef}
        >
          Composed records
        </Progress.Label>
        <Progress.Track
          aria-label="Composed track"
          style={{ width: 200, height: 8 }}
          render={<div data-composed="track" />}
          ref={recordProgressRef}
        >
          <Progress.Indicator
            aria-label="Composed indicator"
            style={{ backgroundColor: 'rgb(20, 80, 120)' }}
            render={(props, state) =>
              createElement('div', {
                ...props,
                'data-render-status': state.status,
              })
            }
            ref={recordProgressRef}
          />
        </Progress.Track>
        <Progress.Value
          aria-label="Composed value"
          render={<output />}
          ref={recordProgressRef}
        >
          {(formattedValue, value) =>
            isDefined(value) ? `${formattedValue} of records` : 'Waiting'
          }
        </Progress.Value>
      </Progress.Root>
      <ProgressBar
        value={1}
        aria-label="Compact progress"
        style={{ width: 8 }}
      />
      <MetricRow
        startIcon={<IconDatabase size={14} />}
        value={<Text render={<bdi />}>25 / 100 GB</Text>}
        progress={25}
        progressValueText="25 of 100 gigabytes used"
      >
        <Text render={<strong />}>Storage</Text>
      </MetricRow>
      <MetricRow value={0}>Completed imports</MetricRow>
      <ProgressRing value={-10} size="sm" aria-label="Empty progress" />
      <ProgressRing value={120} size="sm" aria-label="Complete progress" />
      <Button onClick={() => setProgress(55)}>Advance progress</Button>
      <Button onClick={() => setRange({ min: 30, max: 130 })}>
        Change progress range
      </Button>
      <Button onClick={() => setProgress(null)}>Wait for records</Button>
      <Button onClick={() => setProgress(150)}>Complete import</Button>
      <Button onClick={() => setProgress(30)}>Reset import</Button>
      <output aria-label="Progress pointer entries">{pointerEntries}</output>
    </TwentyUiGalleryCard>
  );
};

export default defineFrontComponent({
  universalIdentifier: 'bdc37e74-31d3-4a94-9805-03bd38f40ddf',
  name: 'twenty-ui-progress',
  description:
    'Progress composition, normalized ranges and native props in the sandbox',
  component: ProgressExample,
});
