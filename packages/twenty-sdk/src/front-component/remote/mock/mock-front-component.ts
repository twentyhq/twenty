/* eslint-disable */
//@ts-nocheck
import React, { useEffect, useState } from 'react';

import {
  HtmlButton,
  HtmlDiv,
  HtmlH3,
  HtmlP,
} from '../generated/remote-components';

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
