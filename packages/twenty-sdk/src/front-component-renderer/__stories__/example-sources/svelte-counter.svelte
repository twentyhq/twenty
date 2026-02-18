<script>
  let count = 0;
</script>

<div
  data-testid="svelte-component"
  style="padding: 24px; background-color: #fff7ed; border: 2px solid #fb923c; border-radius: 12px; font-family: system-ui, sans-serif;"
>
  <h2
    style="color: #9a3412; font-weight: 700; font-size: 18px; margin-bottom: 12px;"
  >
    Svelte Component
  </h2>
  <span
    style="display: inline-block; padding: 2px 8px; background-color: #fb923c; color: white; border-radius: 4px; font-size: 11px; font-weight: 600; margin-bottom: 16px;"
  >
    svelte
  </span>
  <p
    data-testid="svelte-count"
    style="font-size: 28px; font-weight: 800; color: #c2410c; margin-top: 16px; margin-bottom: 16px;"
  >
    Count: {count}
  </p>
  <button
    data-testid="svelte-button"
    on:click={() => count++}
    style="padding: 10px 20px; background-color: #f97316; color: white; border: none; border-radius: 6px; font-weight: 600; cursor: pointer;"
  >
    Increment
  </button>
</div>
