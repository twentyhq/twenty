# README
DISCLAIMER: The k8s and podman deployments are not maintained by the core team.
These files are provided and maintained by the community. Twenty core team
maintains support for docker deployment.

## Overview

This repository contains Kubernetes manifests and Terraform files to help you deploy and manage the TwentyCRM application. The files are located in the `packages/twenty-docker/k8s` directory.

## Prerequisites

Before using these files, ensure you have the following installed and configured on your system:

- Kubernetes cluster (e.g., Minikube, EKS, GKE)
- kubectl
- Terraform
- Docker

## Setup Instructions

### Step 1: Clone the Repository

Clone the repository to your local machine:

``` bash
git clone https://github.com/twentyhq/twenty.git
cd twentycrm/packages/twenty-docker/k8s
```

### Step 2: Customize the Manifests and Terraform Files

**Important:** These files require customization for your specific implementation. Update the placeholders and configurations according to your environment and requirements.

### Step 3: Deploy with Terraform

1. Navigate to the Terraform directory:

    ```bash
    cd terraform
    ```

2. Initialize Terraform:

    ```bash
    terraform init
    ```

3. Plan the deployment:

    ```bash
    terraform plan
    ```

4. Apply the deployment:

    ```bash
    terraform apply
    ```

## OR

### Step 3: Deploy with Kubernetes Manifests

1. Navigate to the Kubernetes manifests directory:

    ```bash
    cd ../k8s
    ```

2. Create Server Secret

    ``` bash
    kubectl create secret generic -n twentycrm tokens --from-literal accessToken=changeme --from-literal loginToken="changeme" --from-literal refreshToken="changeme" --from-literal fileToken="changeme"
    ```

3. Apply the manifests:

    ```bash
    kubectl apply -f .
    ```

## Customization

### Kubernetes Manifests

- **Namespace:** Update the `namespace` in the manifests as needed.
- **Resource Limits:** Adjust the resource limits and requests according to your application's requirements.
- **Environment Variables:** Configure server tokens in the `Secret` command above.

### Terraform Files

- **Variables:** Update the variables in the `variables.tf` file to match your environment.
- **Locals:** Update the locals in the `main.tf` file to match your environment.
- **Providers:** Ensure the provider configurations (e.g., AWS, GCP) are correct for your setup.
- **Resources:** Modify the resource definitions as needed to fit your infrastructure.

## Troubleshooting

### Common Issues

- **Connectivity:** Ensure your Kubernetes cluster is accessible and configured correctly.
- **Permissions:** Verify that you have the necessary permissions to deploy resources in your cloud provider.
- **Resource Limits:** Adjust resource limits if you encounter issues related to insufficient resources.

### Logs and Debugging

- Use `kubectl logs` to check the logs of your Kubernetes pods.
- Use `terraform show` and `terraform state` to inspect your Terraform state and configurations.

## Conclusion

This setup provides a basic structure for deploying the TwentyCRM application using Kubernetes and Terraform. Ensure you thoroughly customize the manifests and Terraform files to suit your specific needs. For any issues or questions, please refer to the official documentation of Kubernetes and Terraform or seek support from your cloud provider.

---

Feel free to contribute and improve this repository by submitting pull requests or opening issues. Happy deploying!
