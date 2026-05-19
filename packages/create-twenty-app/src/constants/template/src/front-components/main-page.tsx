import { defineFrontComponent } from 'twenty-sdk/define';
import { useState } from 'react';

import {
  APP_DISPLAY_NAME,
  MAIN_PAGE_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

const DOCS_BASE_URL = 'https://docs.twenty.com/developers/extend/apps';

const CATEGORIES = [
  {
    title: 'Data model',
    color: '#73D08D',
    items: [
      { label: 'CUSTOM OBJECT', href: `${DOCS_BASE_URL}/data/objects` },
      {
        label: 'CUSTOM FIELDS',
        href: `${DOCS_BASE_URL}/data/extending-objects`,
      },
    ],
    rotation: '2.4deg',
  },
  {
    title: 'Logic',
    color: '#F4D345',
    items: [
      {
        label: 'TOOLS',
        href: `${DOCS_BASE_URL}/logic/logic-functions`,
      },
      {
        label: 'SERVERLESS FUNCT.',
        href: `${DOCS_BASE_URL}/logic/logic-functions`,
      },
      {
        label: 'SKILLS',
        href: `${DOCS_BASE_URL}/logic/skills-and-agents`,
      },
    ],
    rotation: '0deg',
  },
  {
    title: 'Layout',
    color: '#C4A2E0',
    items: [
      { label: 'VIEWS', href: `${DOCS_BASE_URL}/layout/views` },
      { label: 'WIDGETS', href: `${DOCS_BASE_URL}/layout/page-layouts` },
      {
        label: 'LAYOUT PAGES',
        href: `${DOCS_BASE_URL}/layout/page-layouts`,
      },
      {
        label: 'COMMANDS',
        href: `${DOCS_BASE_URL}/layout/command-menu-items`,
      },
    ],
    rotation: '-2.8deg',
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

const ArrowUpRight = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path
      d="M4.5 3.5H10.5V9.5M10.5 3.5L3.5 10.5"
      stroke="#999"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
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
  items: ReadonlyArray<{ label: string; href: string }>;
  rotation: string;
}) => {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        border: `1px solid ${color}80`,
        borderRadius: '12px',
        overflow: 'hidden',
        width: '240px',
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
          padding: '8px',
          gap: '4px',
        }}
      >
        {items.map((item) => {
          const isHovered = hoveredItem === item.label;

          return (
            <a
              key={item.label}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              onMouseEnter={() => setHoveredItem(item.label)}
              onMouseLeave={() => setHoveredItem(null)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                textDecoration: 'none',
                cursor: 'pointer',
                padding: '10px 12px',
                borderRadius: '8px',
                background: isHovered ? '#0000000A' : 'transparent',
                transition: 'background 0.15s',
              }}
            >
              <ItemIcon color={color} />
              <span
                style={{
                  fontSize: '13px',
                  fontWeight: 300,
                  color: '#333',
                  letterSpacing: '0.5px',
                  flex: 1,
                }}
              >
                {item.label}
              </span>
              {isHovered && <ArrowUpRight />}
            </a>
          );
        })}
      </div>
    </div>
  );
};

const MainPage = () => {
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
      {/*TODO: uncomment when Avatar import is fixed*/}
      {/*<Avatar
        avatarUrl={getPublicAssetUrl('logo.svg')}
        placeholder={APP_DISPLAY_NAME}
        placeholderColorSeed={APP_DISPLAY_NAME}
        type="squared"
        size="xl"
      />*/}
      <span
        style={{
          fontSize: '24px',
          fontWeight: 600,
          color: '#333',
          marginTop: '8px',
        }}
      >
        {APP_DISPLAY_NAME}
      </span>
      <span
        style={{
          fontSize: '13px',
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
        {CATEGORIES.map((category) => (
          <CategoryCard
            key={category.title}
            title={category.title}
            color={category.color}
            items={category.items}
            rotation={category.rotation}
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
