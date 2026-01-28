// Mock component code that runs inside the remote worker

import { isDefined } from 'twenty-shared/utils';

// Uses globalThis.React and globalThis.RemoteComponents which are exposed by the worker
const mockFrontComponentCode = `
const React = globalThis.React;
const { useEffect, useState } = React;

const { HtmlButton, HtmlDiv, HtmlH3, HtmlP } = globalThis.RemoteComponents;

const FrontComponent = () => {
  const [clickCount, setClickCount] = useState(0);
  const [currentTime, setCurrentTime] = useState(
    new Date().toLocaleTimeString(),
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return React.createElement(
    HtmlDiv,
    null,
    React.createElement(HtmlH3, null, 'Remote DOM front component'),
    React.createElement(
      HtmlP,
      null,
      'Rendered in a web worker and mirrored on the host.',
    ),
    React.createElement(
      HtmlButton,
      { onClick: () => setClickCount(clickCount + 1) },
      'Click me',
    ),
    React.createElement(
      HtmlP,
      null,
      'Clicked ',
      clickCount,
      ' time',
      clickCount === 1 ? '' : 's',
    ),
    React.createElement(HtmlP, null, 'Current time: ', currentTime),
  );
};

export default React.createElement(FrontComponent);
`;

let cachedMockBlobUrl: string | null = null;

export const getMockFrontComponentUrl = (): string => {
  if (isDefined(cachedMockBlobUrl)) {
    return cachedMockBlobUrl;
  }

  const blob = new Blob([mockFrontComponentCode], {
    type: 'application/javascript',
  });
  cachedMockBlobUrl = URL.createObjectURL(blob);

  return cachedMockBlobUrl;
};
