import { createElement, useRef, useState } from 'react';
import { AnimatedIconCrossfade } from 'twenty-ui/components/layout';
import { Button } from 'twenty-ui/primitives/input';

export const AnimatedIconCrossfadeExample = () => {
  const iconRef = useRef<HTMLSpanElement>(null);
  const [isActive, setIsActive] = useState(false);
  const [target, setTarget] = useState('Uninspected');

  return (
    <>
      <AnimatedIconCrossfade
        ref={iconRef}
        isActive={isActive}
        activeIcon={
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            data-testid="active-artwork"
          >
            <circle cx="8" cy="8" r="6" fill="currentColor" />
          </svg>
        }
        inactiveIcon={
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            data-testid="inactive-artwork"
          >
            <path d="M2 2h12v12H2z" fill="currentColor" />
          </svg>
        }
        role="img"
        aria-label={isActive ? 'Selection active' : 'Selection inactive'}
        className="custom-crossfade"
        style={{ width: 16, height: 16 }}
        render={(props) =>
          createElement('span', { ...props, 'data-composed': 'crossfade' })
        }
      />
      <Button
        onClick={() => {
          setIsActive(!isActive);
          setTarget(iconRef.current?.tagName ?? 'Missing');
        }}
      >
        Toggle selection
      </Button>
      <output aria-label="Crossfade target">{target}</output>
    </>
  );
};
