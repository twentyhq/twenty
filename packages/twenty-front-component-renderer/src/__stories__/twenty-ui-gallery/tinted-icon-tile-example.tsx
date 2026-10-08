import { useRef, useState } from 'react';
import { TintedIconTile } from 'twenty-ui/components/data-display';
import { IconStar } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';

export const TintedIconTileExample = () => {
  const tileRef = useRef<HTMLDivElement>(null);
  const [target, setTarget] = useState('Uninspected');

  return (
    <>
      <TintedIconTile icon={<IconStar size={16} />} />
      <TintedIconTile
        ref={tileRef}
        icon={
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="currentColor"
            role="img"
            aria-label="Internal artwork"
          >
            <path d="M2 2h16v16H2z" />
          </svg>
        }
        color="blue"
        role="img"
        aria-label="Custom company tile"
        className="custom-tile"
        style={{ width: 32, height: 32 }}
        render={<span data-composed="tile" />}
      />
      <Button onClick={() => setTarget(tileRef.current?.tagName ?? 'Missing')}>
        Inspect tile
      </Button>
      <output aria-label="Tile target">{target}</output>
    </>
  );
};
