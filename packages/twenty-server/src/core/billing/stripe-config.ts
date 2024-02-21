const stripeConfig = () => ({
  apiKey: process.env.STRIPE_API_KEY || '',
  webhookConfig: {
    stripeSecrets: {
      account: process.env.STRIPE_WEBHOOK_SECRET || '',
    },
  },
});

export default stripeConfig;
