import { defineFrontComponent } from '@/sdk';
import { useState } from 'react';

const TAILWIND_CSS = `
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
.p-6{padding:1.5rem}
.space-y-4>:not(:first-child){margin-top:1rem}
.rounded-xl{border-radius:.75rem}
.rounded-md{border-radius:.375rem}
.rounded-full{border-radius:9999px}
.border-2{border-width:2px}
.border-blue-400{border-color:#60a5fa}
.bg-blue-50{background-color:#eff6ff}
.bg-blue-600{background-color:#2563eb}
.bg-blue-100{background-color:#dbeafe}
.bg-purple-500{background-color:#a855f7}
.bg-orange-500{background-color:#f97316}
.bg-green-500{background-color:#22c55e}
.px-3{padding-left:.75rem;padding-right:.75rem}
.px-4{padding-left:1rem;padding-right:1rem}
.py-1{padding-top:.25rem;padding-bottom:.25rem}
.py-2{padding-top:.5rem;padding-bottom:.5rem}
.text-xs{font-size:.75rem;line-height:1rem}
.text-sm{font-size:.875rem;line-height:1.25rem}
.text-lg{font-size:1.125rem;line-height:1.75rem}
.text-2xl{font-size:1.5rem;line-height:2rem}
.font-semibold{font-weight:600}
.font-bold{font-weight:700}
.font-extrabold{font-weight:800}
.text-blue-800{color:#1e40af}
.text-blue-600{color:#2563eb}
.text-blue-700{color:#1d4ed8}
.text-white{color:#fff}
.cursor-pointer{cursor:pointer}
.max-w-sm{max-width:24rem}
.flex{display:flex}
.flex-col{flex-direction:column}
.flex-wrap{flex-wrap:wrap}
.gap-2{gap:.5rem}
.gap-4{gap:1rem}
.items-center{align-items:center}
.border{border-width:1px}
.border-blue-200{border-color:#bfdbfe}
`;

const TailwindComponent = () => {
  const [count, setCount] = useState(0);

  return (
    <>
      <style>{TAILWIND_CSS}</style>
      <div
        data-testid="tailwind-component"
        className="p-6 bg-blue-50 rounded-xl border-2 border-blue-400 max-w-sm space-y-4"
        style={{ fontFamily: 'system-ui, sans-serif' }}
      >
        <h2 className="text-lg font-bold text-blue-800">Tailwind CSS</h2>
        <p className="text-sm text-blue-600">
          Utility-first CSS framework with atomic class composition.
        </p>
        <div className="flex flex-wrap gap-2">
          <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-xs font-semibold">
            Badge
          </span>
          <span className="px-3 py-1 bg-purple-500 text-white rounded-full text-xs font-semibold">
            Styled
          </span>
          <span className="px-3 py-1 bg-orange-500 text-white rounded-full text-xs font-semibold">
            Utility
          </span>
        </div>
        <p
          data-testid="tailwind-count"
          className="text-2xl font-extrabold text-blue-700"
        >
          Count: {count}
        </p>
        <div className="flex gap-2">
          <button
            data-testid="tailwind-button"
            className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md text-sm cursor-pointer"
            onClick={() => setCount((previous) => previous + 1)}
          >
            Increment
          </button>
          <button
            className="px-4 py-2 border border-blue-200 text-blue-700 font-semibold rounded-md text-sm cursor-pointer bg-blue-100"
            onClick={() => setCount(0)}
          >
            Reset
          </button>
        </div>
      </div>
    </>
  );
};

export default defineFrontComponent({
  universalIdentifier: 'test-tailwind-0000-0000-0000-000000000005',
  name: 'tailwind-component',
  description: 'A front component using Tailwind CSS utility classes',
  component: TailwindComponent,
});
