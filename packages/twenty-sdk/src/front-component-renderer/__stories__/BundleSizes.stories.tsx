import { type Meta, type StoryObj } from '@storybook/react-vite';

import bundleSizes from './example-sources-built/bundle-sizes.json';

type BundleSizeEntry = {
  name: string;
  reactBytes: number;
  preactBytes: number;
};

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';

  const kb = bytes / 1024;

  if (kb < 1024) {
    return `${kb.toFixed(1)} KB`;
  }

  return `${(kb / 1024).toFixed(2)} MB`;
};

const formatLabel = (name: string): string =>
  name
    .replace('.front-component', '')
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

const BAR_MAX_WIDTH = 400;

const BundleSizesTable = () => {
  const entries = (bundleSizes as BundleSizeEntry[]).sort(
    (a, b) => b.reactBytes - a.reactBytes,
  );

  const maxBytes = Math.max(...entries.map((entry) => entry.reactBytes));

  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif', padding: 24 }}>
      <h2 style={{ margin: '0 0 4px', fontSize: 18, fontWeight: 600 }}>
        Front Component Bundle Sizes
      </h2>
      <p style={{ margin: '0 0 24px', fontSize: 13, color: '#666' }}>
        Each bar shows the minified .mjs size (React vs Preact runtime)
      </p>

      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: 13,
        }}
      >
        <thead>
          <tr
            style={{
              textAlign: 'left',
              borderBottom: '2px solid #e4e4e7',
            }}
          >
            <th style={{ padding: '8px 12px', width: 180 }}>Component</th>
            <th style={{ padding: '8px 12px' }}>Size</th>
            <th style={{ padding: '8px 12px', width: 100, textAlign: 'right' }}>
              React
            </th>
            <th style={{ padding: '8px 12px', width: 100, textAlign: 'right' }}>
              Preact
            </th>
            <th style={{ padding: '8px 12px', width: 80, textAlign: 'right' }}>
              Saving
            </th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => {
            const reactWidth =
              (entry.reactBytes / maxBytes) * BAR_MAX_WIDTH;
            const preactWidth =
              (entry.preactBytes / maxBytes) * BAR_MAX_WIDTH;
            const saving =
              entry.reactBytes > 0
                ? (
                    ((entry.reactBytes - entry.preactBytes) /
                      entry.reactBytes) *
                    100
                  ).toFixed(0)
                : '0';

            return (
              <tr
                key={entry.name}
                style={{ borderBottom: '1px solid #f0f0f0' }}
              >
                <td
                  style={{
                    padding: '10px 12px',
                    fontWeight: 500,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {formatLabel(entry.name)}
                </td>
                <td style={{ padding: '10px 12px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <div
                      style={{
                        height: 14,
                        width: reactWidth,
                        backgroundColor: '#3b82f6',
                        borderRadius: 3,
                        minWidth: 4,
                      }}
                    />
                    <div
                      style={{
                        height: 14,
                        width: preactWidth,
                        backgroundColor: '#8b5cf6',
                        borderRadius: 3,
                        minWidth: 4,
                      }}
                    />
                  </div>
                </td>
                <td
                  style={{
                    padding: '10px 12px',
                    textAlign: 'right',
                    fontVariantNumeric: 'tabular-nums',
                    color: '#3b82f6',
                  }}
                >
                  {formatBytes(entry.reactBytes)}
                </td>
                <td
                  style={{
                    padding: '10px 12px',
                    textAlign: 'right',
                    fontVariantNumeric: 'tabular-nums',
                    color: '#8b5cf6',
                  }}
                >
                  {formatBytes(entry.preactBytes)}
                </td>
                <td
                  style={{
                    padding: '10px 12px',
                    textAlign: 'right',
                    fontVariantNumeric: 'tabular-nums',
                    color: '#16a34a',
                  }}
                >
                  {saving}%
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div
        style={{
          display: 'flex',
          gap: 16,
          marginTop: 16,
          fontSize: 12,
          color: '#888',
        }}
      >
        <span>
          <span
            style={{
              display: 'inline-block',
              width: 10,
              height: 10,
              backgroundColor: '#3b82f6',
              borderRadius: 2,
              marginRight: 4,
            }}
          />
          React
        </span>
        <span>
          <span
            style={{
              display: 'inline-block',
              width: 10,
              height: 10,
              backgroundColor: '#8b5cf6',
              borderRadius: 2,
              marginRight: 4,
            }}
          />
          Preact
        </span>
      </div>
    </div>
  );
};

const meta: Meta = {
  title: 'FrontComponent/BundleSizes',
  component: BundleSizesTable,
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj;

export const Overview: Story = {};
