(() => {
  const DISCORD_INVITE_URL =
    'https://discord.com/api/v9/invites/cx5n4Jzs57?with_counts=true';
  const GITHUB_LINK_SELECTOR =
    '#navbar .navbar-link > a[href^="https://github.com"]';
  const DISCORD_LINK_SELECTOR =
    '#navbar .navbar-link > a[href^="https://discord.gg"]';

  let discordMemberCount = null;
  let isApplyScheduled = false;

  const formatCompactCount = (count) =>
    new Intl.NumberFormat(document.documentElement.lang || 'en', {
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(count);

  const readRenderedCount = (link) => {
    const digits = (link.lastElementChild?.textContent ?? '').replace(
      /\D/g,
      '',
    );

    return digits === '' ? null : Number(digits);
  };

  const setCount = (link, count) => {
    const formattedCount = formatCompactCount(count);

    if (link.dataset.communityCount !== formattedCount) {
      link.dataset.communityCount = formattedCount;
    }
  };

  const applyCounts = () => {
    isApplyScheduled = false;

    document.querySelectorAll(GITHUB_LINK_SELECTOR).forEach((link) => {
      const starCount = readRenderedCount(link);

      if (starCount !== null) {
        setCount(link, starCount);
      }
    });

    if (discordMemberCount !== null) {
      document.querySelectorAll(DISCORD_LINK_SELECTOR).forEach((link) => {
        setCount(link, discordMemberCount);
      });
    }
  };

  const scheduleApply = () => {
    if (!isApplyScheduled) {
      isApplyScheduled = true;
      requestAnimationFrame(applyCounts);
    }
  };

  fetch(DISCORD_INVITE_URL)
    .then((response) => (response.ok ? response.json() : null))
    .then((invite) => {
      const memberCount = invite?.approximate_member_count;

      if (Number.isFinite(memberCount)) {
        discordMemberCount = memberCount;
        scheduleApply();
      }
    })
    .catch(() => {});

  new MutationObserver(scheduleApply).observe(document.documentElement, {
    childList: true,
    subtree: true,
    characterData: true,
  });

  scheduleApply();
})();
