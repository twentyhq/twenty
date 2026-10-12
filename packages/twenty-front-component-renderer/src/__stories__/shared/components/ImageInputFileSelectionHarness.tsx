import { type ComponentProps, createElement, useState } from 'react';

import { FrontComponentRenderer } from '@/host/components/FrontComponentRenderer';

type ImageInputFileSelectionHarnessProps = ComponentProps<
  typeof FrontComponentRenderer
>;

export const ImageInputFileSelectionHarness = (
  props: ImageInputFileSelectionHarnessProps,
) => {
  const [isPrimaryMounted, setIsPrimaryMounted] = useState(true);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsPrimaryMounted((value) => !value)}
      >
        {isPrimaryMounted
          ? 'Unmount primary renderer'
          : 'Mount primary renderer'}
      </button>
      <section aria-label="Primary renderer">
        {isPrimaryMounted && createElement(FrontComponentRenderer, props)}
      </section>
      <section aria-label="Secondary renderer">
        {createElement(FrontComponentRenderer, props)}
      </section>
    </>
  );
};
