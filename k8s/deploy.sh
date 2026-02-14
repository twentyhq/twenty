#!/bin/bash

# Twenty CRM - OVHcloud Kubernetes Deployment Script
# This script deploys Twenty CRM to OVHcloud Managed Kubernetes

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}====================================${NC}"
echo -e "${GREEN}Twenty CRM - OVHcloud Deployment${NC}"
echo -e "${GREEN}====================================${NC}"
echo ""

# Check if kubectl is installed
if ! command -v kubectl &> /dev/null; then
    echo -e "${RED}Error: kubectl is not installed${NC}"
    echo "Please install kubectl: https://kubernetes.io/docs/tasks/tools/"
    exit 1
fi

# Check if kubectl is configured
if ! kubectl cluster-info &> /dev/null; then
    echo -e "${RED}Error: kubectl is not configured${NC}"
    echo "Please configure kubectl with your OVHcloud kubeconfig:"
    echo "  export KUBECONFIG=/path/to/your/kubeconfig.yaml"
    exit 1
fi

echo -e "${GREEN}✓${NC} kubectl is configured"

# Create namespace if it doesn't exist
echo ""
echo -e "${YELLOW}Creating namespace 'twenty-crm'...${NC}"
kubectl create namespace twenty-crm --dry-run=client -o yaml | kubectl apply -f -
echo -e "${GREEN}✓${NC} Namespace created/verified"

# Check if secrets.yaml exists
if [ ! -f "secrets.yaml" ]; then
    echo ""
    echo -e "${RED}Error: secrets.yaml not found${NC}"
    echo "Please create secrets.yaml from secrets.yaml.template:"
    echo "  1. cp secrets.yaml.template secrets.yaml"
    echo "  2. Edit secrets.yaml and fill in your credentials"
    exit 1
fi

echo ""
echo -e "${YELLOW}Applying Kubernetes manifests...${NC}"

# Apply secrets
echo "  → Applying secrets..."
kubectl apply -f secrets.yaml
echo -e "${GREEN}  ✓${NC} Secrets applied"

# Apply configmap
echo "  → Applying configmap..."
kubectl apply -f configmap.yaml
echo -e "${GREEN}  ✓${NC} ConfigMap applied"

# Apply backend deployment
echo "  → Deploying backend..."
kubectl apply -f backend-deployment.yaml
echo -e "${GREEN}  ✓${NC} Backend deployment created"

# Apply worker deployment
echo "  → Deploying worker..."
kubectl apply -f worker-deployment.yaml
echo -e "${GREEN}  ✓${NC} Worker deployment created"

# Apply frontend deployment
echo "  → Deploying frontend..."
kubectl apply -f frontend-deployment.yaml
echo -e "${GREEN}  ✓${NC} Frontend deployment created"

# Apply ingress
echo "  → Configuring ingress..."
kubectl apply -f ingress.yaml
echo -e "${GREEN}  ✓${NC} Ingress configured"

echo ""
echo -e "${GREEN}====================================${NC}"
echo -e "${GREEN}Deployment Complete!${NC}"
echo -e "${GREEN}====================================${NC}"
echo ""

echo "Checking deployment status..."
echo ""

# Wait a bit for pods to start
sleep 5

# Show pod status
kubectl get pods -n twenty-crm

echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Wait for all pods to be Running (check with: kubectl get pods -n twenty-crm)"
echo "2. Check backend logs: kubectl logs -f deployment/twenty-backend -n twenty-crm"
echo "3. Check worker logs: kubectl logs -f deployment/twenty-worker -n twenty-crm"
echo "4. Get Ingress IP: kubectl get ingress -n twenty-crm"
echo "5. Update your DNS records to point to the Ingress IP"
echo ""
echo -e "${GREEN}Happy deploying! 🚀${NC}"
