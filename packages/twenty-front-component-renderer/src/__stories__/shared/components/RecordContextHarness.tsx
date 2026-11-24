import { type ComponentProps, createElement, useState } from 'react';
import { type FrontComponentExecutionContext } from 'twenty-sdk/front-component';

import { FrontComponentRenderer } from '@/host/components/FrontComponentRenderer';

const CONTEXT: FrontComponentExecutionContext = {
  frontComponentId: 'component',
  userId: null,
  recordId: 'first-record',
  selectedRecordIds: ['first-record'],
  selectedObjectMetadata: {
    id: 'company-object',
    nameSingular: 'company',
    namePlural: 'companies',
  },
  timelineActivityId: null,
  colorScheme: 'light',
};

type RecordContextHarnessProps = ComponentProps<typeof FrontComponentRenderer>;

export const RecordContextHarness = (props: RecordContextHarnessProps) => {
  const [context, setContext] = useState(CONTEXT);
  const [isMounted, setIsMounted] = useState(true);

  return (
    <>
      <button
        onClick={() =>
          setContext({
            ...CONTEXT,
            selectedRecordIds: ['second-record'],
            recordId: 'second-record',
            colorScheme: 'dark',
            userId: 'preview-user',
            selectedObjectMetadata: {
              id: 'opportunity-object',
              nameSingular: 'opportunity',
              namePlural: 'opportunities',
            },
          })
        }
      >
        Switch record
      </button>
      <button
        onClick={() =>
          setContext({
            ...CONTEXT,
            selectedRecordIds: [],
            recordId: null,
            selectedObjectMetadata: null,
          })
        }
      >
        Clear selection
      </button>
      <button onClick={() => setIsMounted((value) => !value)}>
        {isMounted ? 'Unmount widget' : 'Mount widget'}
      </button>
      {isMounted &&
        createElement(FrontComponentRenderer, {
          ...props,
          executionContext: context,
          colorScheme: context.colorScheme,
        })}
    </>
  );
};
