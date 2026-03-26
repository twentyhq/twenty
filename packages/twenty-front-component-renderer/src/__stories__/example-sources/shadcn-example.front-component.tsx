import { useState } from 'react';
import { defineFrontComponent } from '@/sdk';

const SHADCN_CSS = `
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
.inline-flex{display:inline-flex}
.flex{display:flex}
.flex-col{display:flex;flex-direction:column}
.flex-wrap{flex-wrap:wrap}
.items-center{align-items:center}
.justify-center{justify-content:center}
.gap-2{gap:.5rem}
.gap-4{gap:1rem}
.rounded-md{border-radius:.375rem}
.rounded-xl{border-radius:.75rem}
.rounded-full{border-radius:9999px}
.border-2{border-width:2px}
.border-slate-300{border-color:#cbd5e1}
.bg-white{background-color:#fff}
.bg-slate-900{background-color:#0f172a}
.bg-slate-100{background-color:#f1f5f9}
.bg-red-500{background-color:#ef4444}
.bg-emerald-500{background-color:#10b981}
.bg-violet-500{background-color:#8b5cf6}
.p-6{padding:1.5rem}
.px-3{padding-left:.75rem;padding-right:.75rem}
.px-4{padding-left:1rem;padding-right:1rem}
.py-1{padding-top:.25rem;padding-bottom:.25rem}
.py-2{padding-top:.5rem;padding-bottom:.5rem}
.h-9{height:2.25rem}
.text-xs{font-size:.75rem;line-height:1rem}
.text-sm{font-size:.875rem;line-height:1.25rem}
.text-lg{font-size:1.125rem;line-height:1.75rem}
.text-2xl{font-size:1.5rem;line-height:2rem}
.font-medium{font-weight:500}
.font-semibold{font-weight:600}
.font-bold{font-weight:700}
.font-extrabold{font-weight:800}
.text-slate-900{color:#0f172a}
.text-white{color:#fff}
.text-slate-500{color:#64748b}
.text-slate-700{color:#334155}
.max-w-sm{max-width:24rem}
.cursor-pointer{cursor:pointer}
.border{border-width:1px}
.border-slate-200{border-color:#e2e8f0}
.transition-colors{transition:color .15s,background-color .15s,border-color .15s}
`;

const ShadcnComponent = () => {
  const [count, setCount] = useState(0);

  return (
    <>
      <style>{SHADCN_CSS}</style>
      <div
        data-testid="shadcn-component"
        className="p-6 bg-white rounded-xl border-2 border-slate-300 max-w-sm flex-col gap-4"
        style={{ fontFamily: 'system-ui, sans-serif' }}
      >
        <h2 className="text-lg font-bold text-slate-900">shadcn / ui</h2>
        <p className="text-sm text-slate-500">
          Composable primitives powered by Radix UI and Tailwind CSS.
        </p>
        <div className="flex flex-wrap gap-2">
          <span className="px-3 py-1 bg-slate-900 text-white rounded-full text-xs font-semibold">
            Badge
          </span>
          <span className="px-3 py-1 bg-violet-500 text-white rounded-full text-xs font-semibold">
            Styled
          </span>
          <span className="px-3 py-1 bg-emerald-500 text-white rounded-full text-xs font-semibold">
            Composable
          </span>
        </div>
        <p
          data-testid="shadcn-count"
          className="text-2xl font-extrabold text-slate-700"
        >
          Count: {count}
        </p>
        <div className="flex gap-2">
          <button
            data-testid="shadcn-button"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium h-9 px-4 py-2 cursor-pointer bg-slate-900 text-white transition-colors"
            onClick={() => setCount((previous) => previous + 1)}
          >
            Increment
          </button>
          <button
            className="inline-flex items-center justify-center rounded-md text-sm font-medium h-9 px-4 py-2 cursor-pointer border border-slate-200 bg-white text-slate-700 transition-colors"
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
  universalIdentifier: 'test-shadcn-0000-0000-0000-000000000008',
  name: 'shadcn-component',
  description:
    'A front component simulating the shadcn UI pattern (Tailwind + composable primitives)',
  component: ShadcnComponent,
});
