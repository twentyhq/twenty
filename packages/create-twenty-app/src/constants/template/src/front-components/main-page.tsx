import { defineFrontComponent } from 'twenty-sdk/define';
import { Avatar } from 'twenty-sdk/ui';
import { getPublicAssetUrl } from 'twenty-sdk/utils';

import {
  APP_DISPLAY_NAME,
  MAIN_PAGE_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

const CARD_ROTATIONS = ['-2deg', '0deg', '2deg'];

const CATEGORIES = [
  {
    title: 'Data model',
    color: '#F4D345',
    items: ['CUSTOM OBJECT', 'CUSTOM FIELDS'],
  },
  {
    title: 'Logic',
    color: '#73D08D',
    items: ['TOOLS', 'SERVERLESS FUNCT.', 'SKILLS'],
  },
  {
    title: 'Layout',
    color: '#C4A2E0',
    items: ['VIEWS', 'WIDGETS', 'LAYOUT PAGES', 'COMMANDS'],
  },
] as const;

const ItemIcon = ({ color }: { color: string }) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <rect x="2" y="2" width="5" height="5" rx="1" fill={color} />
    <rect x="9" y="2" width="5" height="5" rx="1" fill={color} opacity="0.6" />
    <rect x="2" y="9" width="5" height="5" rx="1" fill={color} opacity="0.6" />
    <rect x="9" y="9" width="5" height="5" rx="1" fill={color} opacity="0.3" />
  </svg>
);

const CategoryCard = ({
  title,
  color,
  items,
  rotation,
}: {
  title: string;
  color: string;
  items: ReadonlyArray<string>;
  rotation: string;
}) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      border: `1px solid ${color}80`,
      borderRadius: '12px',
      overflow: 'hidden',
      width: '260px',
      background: '#FFFFFF',
      transform: `rotate(${rotation})`,
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
    }}
  >
    <div
      style={{
        padding: '16px 20px',
        background: `${color}22`,
      }}
    >
      <span
        style={{
          fontSize: '16px',
          fontWeight: 600,
          color: color,
        }}
      >
        {title}
      </span>
    </div>
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        padding: '14px 20px',
        gap: '14px',
      }}
    >
      {items.map((label) => (
        <div
          key={label}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <ItemIcon color={color} />
          <span
            style={{
              fontSize: '13px',
              fontWeight: 500,
              color: '#666',
              letterSpacing: '0.5px',
            }}
          >
            {label}
          </span>
        </div>
      ))}
    </div>
  </div>
);

const MainPage = () => {
  const logoUrl = getPublicAssetUrl('logo.svg');

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        fontFamily:
          'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        gap: '8px',
        padding: '40px',
      }}
    >
      <Avatar
        avatarUrl={logoUrl}
        placeholder={APP_DISPLAY_NAME}
        placeholderColorSeed={APP_DISPLAY_NAME}
        type="squared"
        size="xl"
      />
      <span
        style={{
          fontSize: '24px',
          fontWeight: 600,
          color: '#141414',
          marginTop: '8px',
        }}
      >
        {APP_DISPLAY_NAME}
      </span>
      <span
        style={{
          fontSize: '14px',
          color: '#888',
          textAlign: 'center',
          lineHeight: '1.5',
        }}
      >
        Was installed successfully.
        <br />
        You can now add content to your app.
      </span>
      <div
        style={{
          display: 'flex',
          gap: '16px',
          marginTop: '32px',
          flexWrap: 'wrap',
          justifyContent: 'center',
          alignItems: 'flex-start',
        }}
      >
        {CATEGORIES.map((category, index) => (
          <CategoryCard
            key={category.title}
            title={category.title}
            color={category.color}
            items={category.items}
            rotation={CARD_ROTATIONS[index]}
          />
        ))}
      </div>
    </div>
  );
};

export default defineFrontComponent({
  universalIdentifier: MAIN_PAGE_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: APP_DISPLAY_NAME,
  description: `${APP_DISPLAY_NAME} front component displaying the app logo and name`,
  component: MainPage,
});
